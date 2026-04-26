import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, update
from src.domain.ports.notification_repo import INotificationRepo
from src.domain.entities.collaboration import Notification
from src.infrastructure.db.collab_models import NotificationModel
from uuid import UUID
from typing import List

class NotificationRepoImpl(INotificationRepo):
    def __init__(self):
        db_url = os.environ.get("DATABASE_URL", "")
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        # asyncpg doesn't support sslmode or channel_binding in the URL
        if "?" in db_url:
            base_url, query = db_url.split("?", 1)
            db_url = base_url

        self.engine = create_async_engine(
            db_url,
            connect_args={"ssl": True} if "neon.tech" in db_url else {}
        )
        self.async_session = sessionmaker(
            self.engine, expire_on_commit=False, class_=AsyncSession
        )

    async def create(self, notification: Notification) -> None:
        async with self.async_session() as session:
            model = NotificationModel(
                notification_id=notification.notification_id,
                user_id=notification.user_id,
                type=notification.type,
                payload=notification.payload,
                read=notification.read,
                created_at=notification.created_at
            )
            session.add(model)
            await session.commit()

    async def get_unread(self, user_id: UUID) -> List[Notification]:
        async with self.async_session() as session:
            result = await session.execute(
                select(NotificationModel)
                .where(NotificationModel.user_id == user_id, NotificationModel.read == False)
                .order_by(NotificationModel.created_at.desc())
            )
            models = result.scalars().all()
            return [self._to_entity(m) for m in models]

    async def mark_read(self, notification_id: UUID) -> None:
        async with self.async_session() as session:
            stmt = update(NotificationModel).where(NotificationModel.notification_id == notification_id).values(read=True)
            await session.execute(stmt)
            await session.commit()

    async def get_all(self, user_id: UUID, limit: int = 50) -> List[Notification]:
        async with self.async_session() as session:
            result = await session.execute(
                select(NotificationModel)
                .where(NotificationModel.user_id == user_id)
                .order_by(NotificationModel.created_at.desc())
                .limit(limit)
            )
            models = result.scalars().all()
            return [self._to_entity(m) for m in models]

    def _to_entity(self, model) -> Notification:
        return Notification(
            notification_id=model.notification_id,
            user_id=model.user_id,
            type=model.type,
            payload=model.payload,
            read=model.read,
            created_at=model.created_at
        )
