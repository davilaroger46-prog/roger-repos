from fastapi import APIRouter, HTTPException
from app.schemas.ai import GenerateCaseInput
from app.services.anthropic_service import generate_orthopedic_case

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate-case")
def generate_case(payload: GenerateCaseInput):
    try:
        case = generate_orthopedic_case(
            tema=payload.tema,
            nivel=payload.nivel,
            regiao=payload.regiao,
        )

        return case

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
