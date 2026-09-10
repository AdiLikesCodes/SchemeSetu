import logging
import uuid
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException, status, Query, Response
from app.core.config import settings
from app.channels.whatsapp.adapter import whatsapp_adapter
from app.channels.whatsapp.client import whatsapp_client
from app.services.chat_service import chat_service
from app.repositories.channel_event_repository import channel_event_repository
from app.repositories.channel_session_repository import channel_session_repository
from app.models.channel_session import ChannelSession

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/channels", tags=["Channels"])

async def get_or_create_channel_session(channel: str, external_user_id: str) -> str:
    mapping = await channel_session_repository.get_mapping(channel, external_user_id)
    if mapping:
        return mapping.session_id
    
    new_session_id = f"sess_{uuid.uuid4().hex[:12]}"
    new_mapping = ChannelSession(
        channel=channel,
        external_user_id=external_user_id,
        session_id=new_session_id
    )
    await channel_session_repository.upsert_mapping(new_mapping)
    return new_session_id

@router.get("/whatsapp/webhook")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    """
    Meta WhatsApp Cloud API Webhook verification handshake.
    """
    if hub_mode == "subscribe" and hub_verify_token:
        expected_token = settings.WHATSAPP_VERIFY_TOKEN
        if not expected_token or hub_verify_token == expected_token:
            logger.info("WhatsApp webhook verified successfully")
            return Response(content=hub_challenge, media_type="text/plain")
    
    logger.warning("WhatsApp webhook verification token mismatch")
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verification token mismatch")

@router.post("/whatsapp/webhook")
async def whatsapp_webhook(request: Request):
    """
    Meta WhatsApp Cloud API Webhook.
    """
    body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256", "")

    if not whatsapp_adapter.verify_webhook(signature, body):
        logger.warning("Invalid WhatsApp webhook signature")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    payload = await request.json()
    message_id = whatsapp_adapter.extract_event_id(payload)
    
    if message_id:
        # Atomic claim to prevent duplicate webhook processing
        event = await channel_event_repository.claim_event("whatsapp_meta", "whatsapp", message_id)
        if not event:
            logger.info("Webhook event %s already processed or duplicate, ignoring", message_id)
            return {"status": "ignored"}
    else:
        logger.warning("No message ID found in WhatsApp webhook payload, cannot guarantee idempotency")

    try:
        if message_id:
            await channel_event_repository.update_event_status("whatsapp_meta", message_id, "PROCESSING")

        incoming = await whatsapp_adapter.parse_event(payload)
        
        # Link channel external ID to internal session
        internal_session_id = await get_or_create_channel_session("whatsapp", incoming.external_user_id)
        incoming.session_id = internal_session_id

        # Process conversation turn
        outgoing, _ = await chat_service.process_chat_turn(incoming)

        # Send response via WhatsApp client
        response_payload = await whatsapp_adapter.format_response(outgoing, to=incoming.external_user_id)
        await whatsapp_client.send_message(response_payload)

        if message_id:
            await channel_event_repository.update_event_status("whatsapp_meta", message_id, "PROCESSED")

        return {"status": "ok"}
    except Exception as e:
        logger.exception("Error processing WhatsApp webhook")
        if message_id:
            await channel_event_repository.update_event_status("whatsapp_meta", message_id, "FAILED")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
