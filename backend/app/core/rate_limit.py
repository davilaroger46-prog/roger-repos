import time
import redis

from app.core.config import REDIS_URL
from app.core.errors import AppError

redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True,
)


def rate_limit(
    key: str,
    limit: int = 10,
    window_seconds: int = 3600,
):
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
            details={
                "limit": limit,
                "window_seconds": window_seconds,
            },
        )
