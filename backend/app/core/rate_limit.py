import time
import redis

from app.core.config import REDIS_URL
from app.core.errors import AppError

_memory_store: dict = {}

try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=1)
    redis_client.ping()
    _use_redis = True
except Exception:
    redis_client = None
    _use_redis = False


def rate_limit(
    key: str,
    limit: int = 10,
    window_seconds: int = 3600,
):
    if _use_redis:
        _rate_limit_redis(key, limit, window_seconds)
    else:
        _rate_limit_memory(key, limit, window_seconds)


def _rate_limit_redis(key: str, limit: int, window_seconds: int):
    now = int(time.time())
    redis_key = f"rate_limit:{key}"
    pipe = redis_client.pipeline()
    pipe.zremrangebyscore(redis_key, 0, now - window_seconds)
    pipe.zcard(redis_key)
    pipe.zadd(redis_key, {str(now): now})
    pipe.expire(redis_key, window_seconds)
    _, count, _, _ = pipe.execute()
    if count >= limit:
        raise AppError(
            status_code=429,
            code="RATE_LIMITED",
            message="Limite de uso da IA atingido. Tente novamente mais tarde.",
            details={"limit": limit, "window_seconds": window_seconds},
        )


def _rate_limit_memory(key: str, limit: int, window_seconds: int):
    now = int(time.time())
    timestamps = [t for t in _memory_store.get(key, []) if t > now - window_seconds]
    if len(timestamps) >= limit:
        raise AppError(
            status_code=429,
            code="RATE_LIMITED",
            message="Limite de uso da IA atingido. Tente novamente mais tarde.",
            details={"limit": limit, "window_seconds": window_seconds},
        )
    timestamps.append(now)
    _memory_store[key] = timestamps
