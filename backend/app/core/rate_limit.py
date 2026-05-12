import time
from collections import defaultdict

from app.core.errors import AppError


_BUCKETS = defaultdict(list)


def rate_limit(
    key: str,
    limit: int = 10,
    window_seconds: int = 3600,
):
    now = time.time()
    window_start = now - window_seconds

    requests = _BUCKETS[key]

    _BUCKETS[key] = [
        timestamp for timestamp in requests
        if timestamp > window_start
    ]

    if len(_BUCKETS[key]) >= limit:
        raise AppError(
            status_code=429,
            code="RATE_LIMITED",
            message="Limite de uso da IA atingido. Tente novamente mais tarde.",
            details={
                "limit": limit,
                "window_seconds": window_seconds,
            },
        )

    _BUCKETS[key].append(now)
