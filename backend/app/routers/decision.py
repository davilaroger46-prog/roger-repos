from fastapi import APIRouter
from app.services.ao_engine import ao_decision_engine

router = APIRouter()

@router.post("/decision/ao")
def run_decision(payload: dict):
    return ao_decision_engine(payload)
