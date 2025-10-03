import asyncio
from os import environ
from typing import Optional, Dict, Set

from redis.asyncio import Redis


class RedisConnection:
    """Enhanced Redis connection manager with multi-worker support."""

    def __init__(self, redis_broker_url: str):
        self.redis_broker_url = redis_broker_url
        self.redis: Optional[Redis] = None

        # Local in-memory state (per worker)
        self.clients: Dict[str, asyncio.Queue] = {}
        self.groups: Dict[str, Set[str]] = {}

        # Background task for pub/sub
        self._pubsub_task: Optional[asyncio.Task] = None
        self._is_initialized = False

    async def initialize(self):
        """Initialize Redis connection without starting pub/sub automatically."""
        try:
            self.redis = await Redis.from_url(self.redis_broker_url)

            # Test connection
            await self.redis.ping()

            self._is_initialized = True
            print("Redis connection initialized successfully")
            return self.redis

        except Exception as e:
            print(f"Failed to initialize Redis: {e}")
            raise

    async def get_instance(self) -> Redis:
        """Get Redis instance, ensuring it's initialized."""
        if not self._is_initialized or not self.redis:
            raise RuntimeError("Redis connection is not initialized")
        return self.redis

    async def close(self):
        """Clean shutdown of Redis connections."""
        try:
            # Close main Redis connection
            if self.redis:
                await self.redis.close()

            print("Redis connections closed successfully")
        except Exception as e:
            print(f"Error closing Redis connections: {e}")

# Global redis connection instance
_redis_client: Optional[RedisConnection] = None


async def init_redis():
    """Initialize global Redis connection."""
    global _redis_client
    if _redis_client is None:
        redis_broker_url = environ.get("REDIS_BROKER")
        if redis_broker_url is None:
            raise Exception("REDIS_BROKER not supplied as an ENV variable")

        _redis_client = RedisConnection(redis_broker_url)
        await _redis_client.initialize()
        print("Global Redis connection initialized")


async def get_redis() -> RedisConnection:
    """Get global Redis connection instance."""
    if _redis_client is None:
        raise RuntimeError("Redis connection is not initialized")
    return _redis_client


async def close_redis():
    """Close global Redis connection."""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
