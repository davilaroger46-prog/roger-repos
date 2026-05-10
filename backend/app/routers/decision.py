"""
Router - /decision
Delega a lógica médica para app.services.ao_engine.
Faz o mapeamento entre os campos do engine e o schema Pydantic.
"""

from fastapi import APIRouter
from app.models import AoDecisionInput, AoDecisionOutput
from app.services.ao_engine import ao_decision_engine

router = APIRouter()


@router.post("/ao", response_model=AoDecisionOutput)
async def ao_decision(payload: AoDecisionInput):
    result = ao_decision_engine(payload.model_dump())

    # engine retorna "conduta" → modelo espera "conduta_sugerida"
    return AoDecisionOutput(
        gravidade=result["gravidade"],
        conduta_sugerida=result["conduta"],
        tecnica_preferida=result["tecnica_preferida"],
        implante=result["implante"],
        alertas=result["alertas"],
        justificativa=result["justificativa"],
        nivel_urgencia=result["nivel_urgencia"],
    )
