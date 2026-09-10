import logging
from typing import Optional, Dict
from datetime import datetime, timezone
from pymongo.errors import DuplicateKeyError
from app.core.database import get_database
from app.models.channel_event import ChannelEvent

logger = logging.getLogger(__name__)

class ChannelEventRepository:
    def __init__(self):
        self.collection_name = "channel_events"

    async def create_indexes(self):
        db = get_database()
        if db is not None:
            await db[self.collection_name].create_index(
                [("provider", 1), ("external_event_id", 1)],
                unique=True
            )

    async def claim_event(self, provider: str, channel: str, external_event_id: str) -> Optional[ChannelEvent]:
        """
        Atomically claims an incoming webhook event.
        Returns the ChannelEvent if successfully claimed (inserted).
        Returns None if already claimed (duplicate).
        """
        db = get_database()
        if db is None:
            # Fallback for tests if db is missing, but in production we need DB.
            return None

        event = ChannelEvent(
            provider=provider,
            channel=channel,
            external_event_id=external_event_id,
            received_at=datetime.now(timezone.utc)
        )

        try:
            await db[self.collection_name].insert_one(event.model_dump(mode="json"))
            return event
        except DuplicateKeyError:
            return None
        except Exception as err:
            logger.warning("Error claiming event %s/%s: %s", provider, external_event_id, err)
            return None

    async def update_event_status(self, provider: str, external_event_id: str, status: str) -> None:
        db = get_database()
        if db is not None:
            try:
                await db[self.collection_name].update_one(
                    {"provider": provider, "external_event_id": external_event_id},
                    {"$set": {"status": status, "processed_at": datetime.now(timezone.utc).isoformat()}}
                )
            except Exception as err:
                logger.warning("Error updating event status: %s", err)

channel_event_repository = ChannelEventRepository()
