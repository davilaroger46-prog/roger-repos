"""
OrthoStudy API - FastAPI Backend
uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import cases, decision, progress

app = FastAPI(
    title="OrthoStudy API",
    description="Plataforma de casos clínicos e motor de decisão AO/OTA",
    version="2.0.0",
)

# ─── CORS ────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────

app.include_router(cases.router,    prefix="/cases",    tags=["Casos"])
app.include_router(decision.router, prefix="/decision", tags=["Decisão AO"])
app.include_router(progress.router, prefix="/progress", tags=["Progresso"])

# ─── Startup ─────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    await init_db()

# ─── Health ──────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "version": "2.0.0"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
