import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ai, cases, auth
from app.core.logging import logger

app = FastAPI(
    title="OrthoStudy API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000
    logger.info(
        "%s %s %s %.0fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


app.include_router(ai.router)
app.include_router(cases.router)
app.include_router(auth.router)


@app.get("/")
def root():
    logger.info("Health check acessado")

    return {
        "app": "OrthoStudy API",
        "status": "online",
        "version": "2.0.0",
    }
