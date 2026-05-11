"""
Router - /generate
Recebe um tema e gera um caso clínico completo via Claude API.
Salva automaticamente no banco após geração.
"""

import asyncio
import json
from fastapi import APIRouter, HTTPException
from app.models import GenerateCaseInput
from app.services.case_generator import generate_orthopedic_case
from app.database import get_db

router = APIRouter()


@router.post("/", response_model=dict)
async def generate(payload: GenerateCaseInput):
    try:
        caso = await asyncio.to_thread(
            generate_orthopedic_case,
            payload.tema,
            payload.nivel,
            payload.regiao,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar caso: {str(e)}")

    meta = caso.get("meta", {})
    caso_id = meta.get("id")
    if not caso_id:
        raise HTTPException(status_code=500, detail="JSON gerado sem campo meta.id")

    db = await get_db()
    try:
        existing = await db.execute_fetchall(
            "SELECT id FROM cases WHERE id = ?", (caso_id,)
        )
        if existing:
            await db.execute(
                "UPDATE cases SET data = ?, updated_at = datetime('now') WHERE id = ?",
                (json.dumps(caso, ensure_ascii=False), caso_id),
            )
        else:
            await db.execute(
                "INSERT INTO cases (id, regiao, nivel, titulo, data) VALUES (?, ?, ?, ?, ?)",
                (
                    caso_id,
                    meta.get("regiao", ""),
                    meta.get("nivel", "avancado"),
                    meta.get("titulo", ""),
                    json.dumps(caso, ensure_ascii=False),
                ),
            )
        await db.commit()
    finally:
        await db.close()

    return {"status": "generated", "id": caso_id, "caso": caso}
