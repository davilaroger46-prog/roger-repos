from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.ai import GenerateCaseInput
from app.schemas.case import ClinicalCase
from app.services.anthropic_service import generate_orthopedic_case, autocorrect_orthopedic_case
from app.db.database import SessionLocal
from app.models.case_model import ClinicalCaseModel
from app.models.user_model import UserModel
from app.deps.auth_deps import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate-case")
def generate_case(
    payload: GenerateCaseInput,
    current_user: UserModel = Depends(get_current_user),
):
    try:
        case = generate_orthopedic_case(
            tema=payload.tema,
            nivel=payload.nivel,
            regiao=payload.regiao,
        )

        db: Session = SessionLocal()
        try:
            new_case = ClinicalCaseModel(
                titulo=case["meta"]["titulo"],
                regiao=case["meta"]["regiao"],
                nivel=case["meta"]["nivel"],
                ao_codigo=case["classificacao"]["ao_ota"]["codigo"],
                user_id=current_user.id,
                caso_json=case,
            )

            db.add(new_case)
            db.commit()
            db.refresh(new_case)

            return new_case.caso_json

        finally:
            db.close()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/autocorrect-case")
def autocorrect_case(payload: dict):
    try:
        corrected = autocorrect_orthopedic_case(payload)
        return corrected

    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=str(e)
        )
