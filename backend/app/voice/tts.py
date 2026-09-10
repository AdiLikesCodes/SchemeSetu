from typing import Protocol

class TextToSpeech(Protocol):
    async def synthesize(self, text: str, language_code: str = "en-IN") -> bytes:
        ...

class GoogleTextToSpeech:
    def __init__(self):
        # In a real setup, initialize google.cloud.texttospeech.TextToSpeechAsyncClient
        pass

    async def synthesize(self, text: str, language_code: str = "en-IN") -> bytes:
        # Stub for MVP
        import logging
        logger = logging.getLogger(__name__)
        logger.info("Simulating TTS for text: %s", text)
        return b"simulated_audio_content"

tts_client = GoogleTextToSpeech()
