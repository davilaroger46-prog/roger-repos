import time

import redis

from app.core.config import REDIS_URL
from app.core.errors import AppError

_redis = redis.from_url(REDIS_URL, decode_responses=True)


def rate_limit(
    key: str,
    limit: int = 10,
    window_seconds: int = 3600,
):
    now = time.time()
    window_start = now - window_seconds

    pipe = _redis.pipeline()
    pipe.zremrangebyscore(key, "-inf", window_start)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window_seconds)
    _, _, count, _ = pipe.execute()

    if count > limit:
        raise AppError(
            status_code=429,
            code="RATE_LIMITED",
            message="Limite de uso da IA atingido. Tente novamente mais tarde.",
            details={
                "limit": limit,
                "window_seconds": window_seconds,
            },
        )
