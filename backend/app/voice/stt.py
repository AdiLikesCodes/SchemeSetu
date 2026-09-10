from typing import Protocol

class SpeechToText(Protocol):
    async def transcribe(self, audio_content: bytes, language_code: str = "en-IN") -> str:
        ...

class GoogleSpeechToText:
    def __init__(self):
        # In a real setup, initialize google.cloud.speech.SpeechAsyncClient
        # using Application Default Credentials.
        pass

    async def transcribe(self, audio_content: bytes, language_code: str = "en-IN") -> str:
        # Stub for MVP, would use:
        # client = speech.SpeechAsyncClient()
        # request = speech.RecognizeRequest(config=..., audio=...)
        # response = await client.recognize(request=request)
        # return response.results[0].alternatives[0].transcript
        import logging
        logger = logging.getLogger(__name__)
        logger.info("Simulating STT for %d bytes of audio", len(audio_content))
        return "Simulated transcription"

stt_client = GoogleSpeechToText()
