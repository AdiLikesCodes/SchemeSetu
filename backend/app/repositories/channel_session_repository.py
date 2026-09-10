import logging
from typing import Optional
from datetime import datetime, timezone
from app.core.database import get_database
from app.models.channel_session import ChannelSession

logger = logging.getLogger(__name__)

class ChannelSessionRepository:
    def __init__(self):
        self.collection_name = "channel_sessions"

    async def create_indexes(self):
        db = get_database()
        if db is not None:
            await db[self.collection_name].create_index(
                [("channel", 1), ("external_user_id", 1)],
                unique=True
            )

    async def get_mapping(self, channel: str, external_user_id: str) -> Optional[ChannelSession]:
        db = get_database()
        if db is not None:
            try:
                doc = await db[self.collection_name].find_one(
                    {"channel": channel, "external_user_id": external_user_id}
                )
                if doc:
                    doc.pop("_id", None)
                    return ChannelSession.model_validate(doc)
            except Exception as err:
                logger.warning("Error fetching channel session mapping: %s", err)
        return None

    async def upsert_mapping(self, session: ChannelSession) -> None:
        db = get_database()
        if db is not None:
            session.updated_at = datetime.now(timezone.utc)
            try:
                await db[self.collection_name].replace_one(
                    {"channel": session.channel, "external_user_id": session.external_user_id},
                    session.model_dump(mode="json"),
                    upsert=True
                )
            except Exception as err:
                logger.warning("Error saving channel session mapping: %s", err)

channel_session_repository = ChannelSessionRepository()
