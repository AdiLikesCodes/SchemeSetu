from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

class ChannelEvent(BaseModel):
    provider: str
    channel: str
    external_event_id: str
    received_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: datetime | None = None
    status: Literal["RECEIVED", "PROCESSING", "PROCESSED", "FAILED"] = "RECEIVED"
