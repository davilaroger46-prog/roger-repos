import time
from collections import defaultdict
from fastapi import HTTPException

# In-memory store: {user_id: [timestamps]}
_request_log: dict[int, list[float]] = defaultdict(list)

WINDOW_SECONDS = 60
MAX_REQUESTS = 10


def check_ai_rate_limit(user_id: int) -> None:
    now = time.time()
    window_start = now - WINDOW_SECONDS

    timestamps = _request_log[user_id]
    timestamps = [t for t in timestamps if t > window_start]
    _request_log[user_id] = timestamps

    if len(timestamps) >= MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail=f"Limite de {MAX_REQUESTS} requisições por minuto atingido. Aguarde e tente novamente.",
        )

    _request_log[user_id].append(now)
