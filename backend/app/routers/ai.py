import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.models.case import Case
from app.schemas.ai import GenerateCaseInput
from app.services.anthropic_service import generate_orthopedic_case

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate-case")
async def generate_case(
    payload: GenerateCaseInput,
    session: AsyncSession = Depends(get_session),
):
    try:
        case_data = await asyncio.to_thread(
            generate_orthopedic_case,
            payload.tema,
            payload.nivel,
            payload.regiao,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    meta = case_data.get("meta", {})
    case_id = meta.get("id")
    if not case_id:
        raise HTTPException(status_code=500, detail="JSON gerado sem campo meta.id")

    existing = await session.get(Case, case_id)
    if existing:
        existing.data   = case_data
        existing.titulo = meta.get("titulo", existing.titulo)
        existing.regiao = meta.get("regiao", existing.regiao)
        existing.nivel  = meta.get("nivel",  existing.nivel)
    else:
        session.add(Case(
            id=case_id,
            titulo=meta.get("titulo", ""),
            regiao=meta.get("regiao", ""),
            nivel=meta.get("nivel", payload.nivel),
            data=case_data,
        ))

    await session.commit()
    return case_data
