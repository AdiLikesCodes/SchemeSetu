import pytest
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.channels.whatsapp.adapter import whatsapp_adapter
from app.core.config import settings
from app.repositories.channel_event_repository import channel_event_repository
from app.repositories.channel_session_repository import channel_session_repository
from app.models.channel_event import ChannelEvent
from app.models.channel_session import ChannelSession
from app.models.user import UserSession, UserProfile
from app.channels.schemas import IncomingMessage, OutgoingMessage

client = TestClient(app)

@pytest.fixture
def mock_whatsapp_secret():
    return "test_secret"

def generate_signature(secret: str, payload: str) -> str:
    return "sha256=" + hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()

def get_whatsapp_payload(message_id="wamid.123", sender="16315551234", text="Hello"):
    return {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "messages": [{
                        "from": sender,
                        "id": message_id,
                        "text": {"body": text},
                        "type": "text"
                    }]
                }
            }]
        }]
    }

@pytest.mark.asyncio
async def test_whatsapp_webhook_verification_handshake():
    """Test Meta webhook subscription verification GET request with hub.challenge."""
    with patch.object(settings, "WHATSAPP_VERIFY_TOKEN", "my_verify_token"):
        # Correct token
        res_ok = client.get(
            "/api/v1/channels/whatsapp/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.challenge": "1158201444",
                "hub.verify_token": "my_verify_token"
            }
        )
        assert res_ok.status_code == 200
        assert res_ok.text == "1158201444"

        # Invalid token
        res_fail = client.get(
            "/api/v1/channels/whatsapp/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.challenge": "1158201444",
                "hub.verify_token": "wrong_token"
            }
        )
        assert res_fail.status_code == 403

@pytest.mark.asyncio
async def test_whatsapp_signature_validation(mock_whatsapp_secret):
    payload = json.dumps(get_whatsapp_payload())
    sig = generate_signature(mock_whatsapp_secret, payload)
    
    with patch.object(settings, "WHATSAPP_APP_SECRET", mock_whatsapp_secret):
        # Direct method test
        assert whatsapp_adapter.verify_webhook(sig, payload.encode()) == True
        
        # API integration test with valid sig
        with patch("app.api.channels.channel_event_repository.claim_event", new_callable=AsyncMock) as mock_claim:
            mock_claim.return_value = ChannelEvent(provider="whatsapp_meta", channel="whatsapp", external_event_id="wamid.123")
            with patch("app.api.channels.chat_service.process_chat_turn", new_callable=AsyncMock) as mock_turn:
                mock_turn.return_value = (OutgoingMessage(text="Hi"), None)
                with patch("app.api.channels.whatsapp_client.send_message", new_callable=AsyncMock):
                    response = client.post("/api/v1/channels/whatsapp/webhook", data=payload, headers={"X-Hub-Signature-256": sig})
                    assert response.status_code == 200

        # API integration test with invalid sig
        response = client.post("/api/v1/channels/whatsapp/webhook", data=payload, headers={"X-Hub-Signature-256": "sha256=invalid"})
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_webhook_idempotency_duplicate_suppression(mock_whatsapp_secret):
    payload = json.dumps(get_whatsapp_payload(message_id="wamid.dup"))
    sig = generate_signature(mock_whatsapp_secret, payload)
    
    with patch.object(settings, "WHATSAPP_APP_SECRET", mock_whatsapp_secret):
        with patch("app.api.channels.channel_event_repository.claim_event", new_callable=AsyncMock) as mock_claim:
            # First claim succeeds
            mock_claim.return_value = ChannelEvent(provider="whatsapp_meta", channel="whatsapp", external_event_id="wamid.dup")
            
            with patch("app.api.channels.chat_service.process_chat_turn", new_callable=AsyncMock) as mock_turn:
                mock_turn.return_value = (OutgoingMessage(text="Hi"), None)
                with patch("app.api.channels.whatsapp_client.send_message", new_callable=AsyncMock):
                    res1 = client.post("/api/v1/channels/whatsapp/webhook", data=payload, headers={"X-Hub-Signature-256": sig})
                    assert res1.status_code == 200
                    assert mock_turn.call_count == 1
            
            # Second claim fails (duplicate)
            mock_claim.return_value = None
            
            with patch("app.api.channels.chat_service.process_chat_turn", new_callable=AsyncMock) as mock_turn:
                res2 = client.post("/api/v1/channels/whatsapp/webhook", data=payload, headers={"X-Hub-Signature-256": sig})
                assert res2.status_code == 200
                assert res2.json() == {"status": "ignored"}
                # Process chat turn NOT called
                assert mock_turn.call_count == 0

@pytest.mark.asyncio
async def test_failed_webhook_retry_semantics(mock_whatsapp_secret):
    payload = json.dumps(get_whatsapp_payload(message_id="wamid.fail"))
    sig = generate_signature(mock_whatsapp_secret, payload)
    
    with patch.object(settings, "WHATSAPP_APP_SECRET", mock_whatsapp_secret):
        with patch("app.api.channels.channel_event_repository.claim_event", new_callable=AsyncMock) as mock_claim:
            mock_claim.return_value = ChannelEvent(provider="whatsapp_meta", channel="whatsapp", external_event_id="wamid.fail")
            
            with patch("app.api.channels.chat_service.process_chat_turn", new_callable=AsyncMock) as mock_turn:
                # Simulate failure during processing
                mock_turn.side_effect = Exception("Simulated failure")
                with patch("app.api.channels.channel_event_repository.update_event_status", new_callable=AsyncMock) as mock_update:
                    response = client.post("/api/v1/channels/whatsapp/webhook", data=payload, headers={"X-Hub-Signature-256": sig})
                    assert response.status_code == 500
                    
                    # Should have transitioned to PROCESSING, then FAILED
                    mock_update.assert_any_call("whatsapp_meta", "wamid.fail", "PROCESSING")
                    mock_update.assert_any_call("whatsapp_meta", "wamid.fail", "FAILED")

@pytest.mark.asyncio
async def test_session_resumption_and_expiration():
    from app.api.channels import get_or_create_channel_session
    
    with patch("app.api.channels.channel_session_repository.get_mapping", new_callable=AsyncMock) as mock_get_mapping:
        with patch("app.api.channels.channel_session_repository.upsert_mapping", new_callable=AsyncMock) as mock_upsert_mapping:
            with patch("app.api.channels.session_repository.get_session", new_callable=AsyncMock) as mock_get_session:
                
                # 1. No existing mapping -> creates new session
                mock_get_mapping.return_value = None
                sess_id_1 = await get_or_create_channel_session("whatsapp", "user1")
                assert sess_id_1.startswith("sess_")
                mock_upsert_mapping.assert_called_once()
                
                # 2. Existing mapping with unexpired session -> resumes same session
                mock_get_mapping.return_value = ChannelSession(channel="whatsapp", external_user_id="user1", session_id=sess_id_1)
                active_session = UserSession(
                    session_id=sess_id_1,
                    profile=UserProfile(),
                    expires_at=datetime.now(timezone.utc) + timedelta(hours=10)
                )
                mock_get_session.return_value = active_session
                sess_id_2 = await get_or_create_channel_session("whatsapp", "user1")
                assert sess_id_1 == sess_id_2
                
                # 3. Existing mapping with expired session -> creates new session
                expired_session = UserSession(
                    session_id=sess_id_1,
                    profile=UserProfile(),
                    expires_at=datetime.now(timezone.utc) - timedelta(minutes=5)
                )
                mock_get_session.return_value = expired_session
                sess_id_3 = await get_or_create_channel_session("whatsapp", "user1")
                assert sess_id_3 != sess_id_1
                assert sess_id_3.startswith("sess_")

@pytest.mark.asyncio
async def test_cross_channel_equivalence():
    """
    Test that web, whatsapp, and voice inputs map to exactly the same canonical IncomingMessage format
    and execute identically through ConversationService.
    """
    from app.channels.web import web_adapter
    from app.channels.whatsapp.adapter import whatsapp_adapter
    from app.voice.service import voice_service
    from app.models.contracts import ChatRequest
    from app.agent.conversation import handle_chat_message

    # Web input
    web_req = ChatRequest(message="I need a loan", session_id="sess_cross", language="en")
    web_incoming = await web_adapter.parse_event(web_req)
    
    # WhatsApp input
    wa_payload = get_whatsapp_payload(text="I need a loan", sender="user_wa")
    wa_incoming = await whatsapp_adapter.parse_event(wa_payload)
    
    # Voice input
    with patch("app.voice.service.stt_client.transcribe", new_callable=AsyncMock) as mock_stt:
        mock_stt.return_value = "I need a loan"
        voice_incoming = await voice_service.handle_audio("user_voice", b"audio")
    
    assert web_incoming.text == "I need a loan"
    assert wa_incoming.text == "I need a loan"
    assert voice_incoming.text == "I need a loan"
    
    assert web_incoming.channel == "web"
    assert wa_incoming.channel == "whatsapp"
    assert voice_incoming.channel == "voice"
    
    with patch("app.agent.conversation.check_all_schemes") as mock_check:
        mock_check.return_value = []
        with patch("app.agent.conversation.sanitize_text_pipeline", new_callable=AsyncMock) as mock_sanitize:
            class MockSanitizedContext:
                def __init__(self):
                    self.sanitized_text = "I need a loan"
                    self.sanitizer_mode = "regex"
            mock_sanitize.return_value = MockSanitizedContext()
            
            with patch("app.agent.conversation.gemini_agent.extract_entities", new_callable=AsyncMock) as mock_gemini:
                class MockExtractionResult:
                    def __init__(self):
                        self.extraction_mode = "gemini"
                        self.age = None
                        self.annual_income = None
                        self.category = None
                        self.gender = None
                        self.business_type = None
                        self.location = None
                        self.state = None
                        self.disability_status = None
                        self.friendly_acknowledgment = None
                    def model_dump(self):
                        return {}
                mock_gemini.return_value = MockExtractionResult()
                
                # Run web
                out_web, _ = await handle_chat_message(web_incoming)
                
                # Run wa
                wa_incoming.session_id = "sess_cross"
                out_wa, _ = await handle_chat_message(wa_incoming)
                
                # Run voice
                voice_incoming.session_id = "sess_cross"
                out_voice, _ = await handle_chat_message(voice_incoming)
                
                # All channels receive equivalent deterministic response
                assert out_web.text == out_wa.text == out_voice.text
