import os
import redis.asyncio as redis
from src.domain.ports.cache import ICache
from typing import Optional

class RedisAdapter(ICache):
    def __init__(self):
        self._redis = redis.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379"))

    async def get(self, key: str) -> Optional[str]:
        val = await self._redis.get(key)
        return val.decode("utf-8") if val else None

    async def set(self, key: str, value: str, expire_seconds: int = 3600) -> None:
        await self._redis.set(key, value, ex=expire_seconds)

    async def delete(self, key: str) -> None:
        await self._redis.delete(key)
