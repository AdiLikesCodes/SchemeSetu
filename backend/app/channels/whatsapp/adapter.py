import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import hashlib
import hmac
from app.channels.base import ChannelAdapter
from app.channels.schemas import IncomingMessage, OutgoingMessage
from app.core.config import settings

logger = logging.getLogger(__name__)

class WhatsAppAdapter(ChannelAdapter):
    def verify_webhook(self, signature: str, body: bytes) -> bool:
        """
        Verifies the signature of the webhook payload sent by Meta.
        """
        app_secret = getattr(settings, "WHATSAPP_APP_SECRET", "").encode('utf-8')
        if not app_secret:
            logger.warning("WHATSAPP_APP_SECRET not configured, skipping verification")
            return True # Or fail depending on strictness

        expected_signature = hmac.new(app_secret, body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(signature.replace("sha256=", ""), expected_signature)

    def extract_event_id(self, event: Dict[str, Any]) -> Optional[str]:
        """
        Extracts the message ID to be used for idempotency.
        """
        try:
            entry = event.get("entry", [])[0]
            change = entry.get("changes", [])[0]
            value = change.get("value", {})
            messages = value.get("messages", [])
            if messages:
                return messages[0].get("id")
        except Exception:
            pass
        return None

    async def parse_event(self, event: Dict[str, Any]) -> IncomingMessage:
        entry = event.get("entry", [])[0]
        change = entry.get("changes", [])[0]
        value = change.get("value", {})
        messages = value.get("messages", [])

        message = messages[0]
        sender_id = message.get("from")
        text = message.get("text", {}).get("body", "")

        return IncomingMessage(
            channel="whatsapp",
            external_user_id=sender_id,
            text=text,
            timestamp=datetime.now(timezone.utc),
            metadata={"whatsapp_message_id": message.get("id")}
        )

    async def format_response(self, outgoing: OutgoingMessage, to: str) -> Dict[str, Any]:
        """
        Formats the canonical outgoing message for Meta API.
        """
        return {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {
                "body": outgoing.text
            }
        }

whatsapp_adapter = WhatsAppAdapter()
