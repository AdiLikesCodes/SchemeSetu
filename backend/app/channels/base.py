from typing import Protocol, Any, Dict
from app.channels.schemas import IncomingMessage, OutgoingMessage

class ChannelAdapter(Protocol):
    async def parse_event(self, event: Dict[str, Any]) -> IncomingMessage:
        ...

    async def format_response(self, outgoing: OutgoingMessage) -> Dict[str, Any]:
        ...
