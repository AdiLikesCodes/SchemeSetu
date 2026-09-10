from typing import Any, Dict
from app.channels.base import ChannelAdapter
from app.channels.schemas import IncomingMessage, OutgoingMessage
from app.models.contracts import ChatRequest, ChatResponse

class WebAdapter(ChannelAdapter):
    async def parse_event(self, request: ChatRequest) -> IncomingMessage:
        return IncomingMessage(
            channel="web",
            external_user_id=request.session_id or "web_user",
            session_id=request.session_id,
            text=request.message,
            language=request.language,
        )

    async def format_response(self, outgoing: OutgoingMessage, chat_response: ChatResponse) -> ChatResponse:
        """
        For web, we want to return the full ChatResponse which includes profiles etc.
        So we just take the chat_response and ensure its text matches outgoing message text.
        """
        chat_response.response_text = outgoing.text
        return chat_response

web_adapter = WebAdapter()
