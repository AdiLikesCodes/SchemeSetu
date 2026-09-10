from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

class ChannelSession(BaseModel):
    channel: Literal["web", "whatsapp", "voice"]
    external_user_id: str
    session_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
