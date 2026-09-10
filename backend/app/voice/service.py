import logging
from typing import Optional
from datetime import datetime, timezone
from app.channels.schemas import IncomingMessage, OutgoingMessage
from app.voice.stt import stt_client
from app.voice.tts import tts_client

logger = logging.getLogger(__name__)

class VoiceService:
    async def handle_audio(self, external_user_id: str, audio_content: bytes, language_code: str = "en-IN") -> tuple[bytes, str]:
        """
        Takes raw audio, converts to text, creates an IncomingMessage,
        and returns the resulting TTS audio and text.
        (Integration with ConversationService will happen at the API layer or adapter layer).
        """
        transcript = await stt_client.transcribe(audio_content, language_code)

        incoming = IncomingMessage(
            channel="voice",
            external_user_id=external_user_id,
            text=transcript,
            language=language_code,
            timestamp=datetime.now(timezone.utc)
        )
        return incoming

    async def generate_audio_response(self, outgoing: OutgoingMessage) -> bytes:
        return await tts_client.synthesize(outgoing.text, outgoing.language or "en-IN")

voice_service = VoiceService()
