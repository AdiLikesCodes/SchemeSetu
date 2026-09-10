from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class IncomingMessage(BaseModel):
    channel: str
    external_user_id: str
    session_id: Optional[str] = None
    text: str
    language: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class OutgoingMessage(BaseModel):
    text: str
    language: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
