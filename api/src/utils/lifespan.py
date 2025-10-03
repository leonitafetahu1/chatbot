from contextlib import asynccontextmanager

from api.src.utils.manager import init_redis, close_redis
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app lifespan: initialize and close managers."""
    await init_redis()

    yield

    await close_redis()