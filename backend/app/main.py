import os
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ai, cases, auth, admin
from app.core.logging import logger

app = FastAPI(
    title="OrthoStudy API",
    version="2.0.0",
)

_cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

_extra = os.getenv("CORS_ORIGINS", "")
if _extra:
    _cors_origins += [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()

    try:
        response = await call_next(request)

        duration_ms = round((time.time() - start) * 1000, 2)

        logger.info(
            f'{request.method} {request.url.path} '
            f'status={response.status_code} '
            f'duration_ms={duration_ms}'
        )

        return response

    except Exception as e:
        duration_ms = round((time.time() - start) * 1000, 2)

        logger.exception(
            f'{request.method} {request.url.path} '
            f'failed duration_ms={duration_ms} error={str(e)}'
        )

        raise


app.include_router(ai.router)
app.include_router(cases.router)
app.include_router(auth.router)
app.include_router(admin.router)


@app.get("/")
def root():
    logger.info("Health check acessado")

    return {
        "app": "OrthoStudy API",
        "status": "online",
        "version": "2.0.0",
    }