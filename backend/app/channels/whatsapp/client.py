import logging
import httpx
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class WhatsAppClient:
    @property
    def phone_number_id(self) -> str:
        return settings.WHATSAPP_PHONE_NUMBER_ID

    @property
    def access_token(self) -> str:
        return settings.WHATSAPP_ACCESS_TOKEN

    @property
    def base_url(self) -> str:
        return f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{self.phone_number_id}/messages"

    async def send_message(self, payload: Dict[str, Any]) -> bool:
        if not self.phone_number_id or not self.access_token:
            logger.warning("WhatsApp client not configured. Simulating send.")
            logger.info("WhatsApp payload: %s", payload)
            return True

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.base_url, json=payload, headers=headers)
                response.raise_for_status()
                return True
            except httpx.HTTPStatusError as e:
                logger.error("WhatsApp API error: %s - %s", e.response.status_code, e.response.text)
                return False
            except Exception as e:
                logger.error("Failed to send WhatsApp message: %s", str(e))
                return False

whatsapp_client = WhatsAppClient()
