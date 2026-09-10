"""
Beanie document model for User Authentication.
"""

from datetime import datetime
from uuid import UUID, uuid4

from beanie import Document
from pydantic import Field


class User(Document):
    """
    Represents a registered beneficiary user in the MongoDB database.
    """

    user_id: UUID = Field(default_factory=uuid4)
    email: str
    password_hash: str
    full_name: str
    phone_number: str | None = None
    category: str = "SC"
    state: str = "Kerala"
    district: str = "Thiruvananthapuram"
    role: str = "beneficiary"  # 'beneficiary' | 'admin'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
