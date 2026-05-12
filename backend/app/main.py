from fastapi import FastAPI
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
