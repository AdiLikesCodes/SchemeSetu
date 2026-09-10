"""
Beanie document model for a channel partner (SCA, Bank, NBFC, CSC).
"""

from beanie import Document
from pydantic import Field


class ChannelPartner(Document):
    """
    Represents an implementation agency or channel partner (e.g. SCA office, Bank branch, CSC center).
    Stored as a document in the `channel_partners` MongoDB collection.
    """

    partner_id: str
    name: str
    type: str  # e.g., "SCA", "Bank", "NBFC", "CSC"
    compatible_schemes: list[str] = Field(default_factory=list)
    latitude: float
    longitude: float
    address: str
    district: str
    state: str
    contact_phone: str
    fund_availability_status: str = "available"  # "available" | "limited" | "unknown"
    rating: float = 4.5

    class Settings:
        name = "channel_partners"
