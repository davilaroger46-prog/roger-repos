from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.models.case import Case

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.get("/")
async def list_cases(
    regiao: Optional[str] = Query(None),
    nivel:  Optional[str] = Query(None),
    q:      Optional[str] = Query(None),
    session: AsyncSession = Depends(get_session),
):
    stmt = select(Case)

    if regiao:
        stmt = stmt.where(Case.regiao.ilike(regiao))
    if nivel:
        stmt = stmt.where(Case.nivel == nivel)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                Case.titulo.ilike(pattern),
                Case.data["output_app"]["resumo"].astext.ilike(pattern),
                Case.data["meta"]["tags"].astext.ilike(pattern),
            )
        )

    result = await session.execute(stmt.order_by(Case.updated_at.desc()))
    cases = result.scalars().all()

    return [
        {
            "id":         c.id,
            "titulo":     c.titulo,
            "regiao":     c.regiao,
            "nivel":      c.nivel,
            "updated_at": c.updated_at,
            "meta":       c.data.get("meta", {}),
            "paciente":   c.data.get("paciente", {}),
            "output_app": c.data.get("output_app", {}),
        }
        for c in cases
    ]


@router.get("/{case_id}")
async def get_case(case_id: str, session: AsyncSession = Depends(get_session)):
    case = await session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Caso '{case_id}' não encontrado.")
    return case.data


@router.delete("/{case_id}")
async def delete_case(case_id: str, session: AsyncSession = Depends(get_session)):
    case = await session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Caso '{case_id}' não encontrado.")
    await session.delete(case)
    await session.commit()
    return {"status": "deleted", "id": case_id}


@router.get("/{case_id}/flashcards")
async def get_flashcards(case_id: str, session: AsyncSession = Depends(get_session)):
    case = await session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Caso '{case_id}' não encontrado.")
    return case.data.get("flashcards", [])
