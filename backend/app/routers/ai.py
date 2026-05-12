from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.ai import GenerateCaseInput
from app.services.anthropic_service import generate_orthopedic_case, autocorrect_orthopedic_case
from app.db.database import SessionLocal
from app.models.case_model import ClinicalCaseModel
from app.models.user_model import UserModel
from app.deps.auth_deps import get_current_user
from app.core.rate_limit import rate_limit
from app.core.errors import AppError, ai_error, validation_error
from app.core.logging import logger

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate-case")
def generate_case(
    payload: GenerateCaseInput,
    current_user: UserModel = Depends(get_current_user),
):
    try:
        rate_limit(
            key=f"generate_case:user:{current_user.id}",
            limit=20,
            window_seconds=3600,
        )

        logger.info(f"Gerando caso | user_id={current_user.id} | tema={payload.tema}")

        case = generate_orthopedic_case(
            tema=payload.tema,
            nivel=payload.nivel,
            regiao=payload.regiao,
        )

        db: Session = SessionLocal()
        try:
            new_case = ClinicalCaseModel(
                user_id=current_user.id,
                titulo=case["meta"]["titulo"],
                regiao=case["meta"]["regiao"],
                nivel=case["meta"]["nivel"],
                ao_codigo=case["classificacao"]["ao_ota"]["codigo"],
                caso_json=case,
            )

            db.add(new_case)
            db.commit()
            db.refresh(new_case)

            return new_case.caso_json

        finally:
            db.close()

    except AppError:
        raise

    except Exception as e:
        raise ai_error(str(e))


@router.post("/autocorrect-case")
def autocorrect_case(
    payload: dict,
    current_user: UserModel = Depends(get_current_user),
):
    try:
        rate_limit(
            key=f"autocorrect_case:user:{current_user.id}",
            limit=30,
            window_seconds=3600,
        )

        corrected = autocorrect_orthopedic_case(payload)
        return corrected

    except AppError:
        raise

    except Exception as e:
        raise validation_error(
            "Erro ao autocorrigir caso",
            {"error": str(e)},
        )
