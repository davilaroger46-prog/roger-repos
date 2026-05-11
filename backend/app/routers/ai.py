from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.schemas.ai import GenerateCaseInput
from app.services.anthropic_service import generate_orthopedic_case
from app.db.database import SessionLocal
from app.models.case_model import ClinicalCaseModel

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate-case")
def generate_case(payload: GenerateCaseInput):
    try:
        case = generate_orthopedic_case(
            tema=payload.tema,
            nivel=payload.nivel,
            regiao=payload.regiao,
        )

        db: Session = SessionLocal()

        new_case = ClinicalCaseModel(
            titulo=case["meta"]["titulo"],
            regiao=case["meta"]["regiao"],
            nivel=case["meta"]["nivel"],
            ao_codigo=case["classificacao"]["ao_ota"]["codigo"],
            caso_json=case,
        )

        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        db.close()

        return case

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
