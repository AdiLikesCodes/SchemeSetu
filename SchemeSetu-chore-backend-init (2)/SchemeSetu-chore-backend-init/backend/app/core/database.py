"""
Database initialization using PyMongo Async and Beanie.
"""

from pymongo import AsyncMongoClient
from beanie import init_beanie

from app.core.config import settings

from app.models.beneficiary import BeneficiaryProfile
from app.models.scheme import Scheme
<<<<<<< HEAD
from app.models.user import User
from app.models.scraper import (
    SchemeSource,
    ScrapeJob,
    ScrapedScheme,
    SchemeVersion,
    ScrapeChange,
    AuditLog,
)
=======
from app.models.partner import ChannelPartner
>>>>>>> 53dfe0fefaf215b8e758df926f828db398e0aef0


async def init_db() -> None:
    """
    Initialize the MongoDB connection and register Beanie document models.

    Should be called once during application startup.
    """

    client = AsyncMongoClient(settings.MONGODB_URI)

    await init_beanie(
        database=client.schemesetu,
<<<<<<< HEAD
        document_models=[
            # Core models
            BeneficiaryProfile,
            Scheme,
            User,
            # Scraper pipeline models
            SchemeSource,
            ScrapeJob,
            ScrapedScheme,
            SchemeVersion,
            ScrapeChange,
            AuditLog,
        ],
=======
        document_models=[BeneficiaryProfile, Scheme, ChannelPartner],
>>>>>>> 53dfe0fefaf215b8e758df926f828db398e0aef0
    )

