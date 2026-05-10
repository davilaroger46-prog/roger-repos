"""
Router - /cases
CRUD completo para casos clínicos (JSON v2.0 em SQLite).
"""

import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.database import get_db
from app.models import CasoCreate, CasoUpdate

router = APIRouter()


@router.get("/", response_model=List[dict])
async def list_cases(
    regiao: Optional[str] = Query(None),
    nivel:  Optional[str] = Query(None),
    q:      Optional[str] = Query(None),
):
    """
    Lista casos com campos de navegação + meta completo.
    Retorna: id, titulo, regiao, nivel, updated_at, meta, paciente, output_app.
    """
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT id, regiao, nivel, titulo, updated_at, data FROM cases"
        )

        cases = []
        for r in rows:
            raw = json.loads(r["data"])
            cases.append({
                # ─── Campos de listagem (acesso direto) ─────────────
                "id":         r["id"],
                "titulo":     r["titulo"],
                "regiao":     r["regiao"],
                "nivel":      r["nivel"],
                "updated_at": r["updated_at"],
                # ─── Subcampos do JSON v2.0 ──────────────────────────
                "meta":       raw.get("meta", {}),
                "paciente":   raw.get("paciente", {}),
                "output_app": raw.get("output_app", {}),
            })

        # ─── Filtros ─────────────────────────────────────────────────
        if regiao:
            cases = [c for c in cases if c["regiao"].lower() == regiao.lower()]
        if nivel:
            cases = [c for c in cases if c["nivel"].lower() == nivel.lower()]
        if q:
            q_lower = q.lower()
            def matches(c):
                return (
                    q_lower in c["titulo"].lower()
                    or q_lower in c["output_app"].get("resumo", "").lower()
                    or q_lower in c["paciente"].get("atividade", "").lower()
                    or any(q_lower in t.lower() for t in c["meta"].get("tags", []))
                )
            cases = [c for c in cases if matches(c)]

        return cases
    finally:
        await db.close()


@router.get("/{caso_id}", response_model=dict)
async def get_case(caso_id: str):
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT data FROM cases WHERE id = ?", (caso_id,)
        )
        if not rows:
            raise HTTPException(status_code=404, detail=f"Caso '{caso_id}' não encontrado.")
        return json.loads(rows[0]["data"])
    finally:
        await db.close()


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_case(caso: CasoCreate):
    db = await get_db()
    try:
        existing = await db.execute_fetchall(
            "SELECT id FROM cases WHERE id = ?", (caso.meta.id,)
        )
        if existing:
            raise HTTPException(status_code=409, detail=f"Caso '{caso.meta.id}' já existe.")

        data_json = caso.model_dump_json(by_alias=True)
        await db.execute(
            "INSERT INTO cases (id, regiao, nivel, titulo, data) VALUES (?, ?, ?, ?, ?)",
            (caso.meta.id, caso.meta.regiao, caso.meta.nivel, caso.meta.titulo, data_json),
        )
        await db.commit()
        return {"status": "created", "id": caso.meta.id}
    finally:
        await db.close()


@router.put("/{caso_id}", response_model=dict)
async def update_case(caso_id: str, update: CasoUpdate):
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT data FROM cases WHERE id = ?", (caso_id,)
        )
        if not rows:
            raise HTTPException(status_code=404, detail=f"Caso '{caso_id}' não encontrado.")

        existing = json.loads(rows[0]["data"])
        patch = update.model_dump(exclude_none=True, by_alias=True)
        for key, value in patch.items():
            if isinstance(value, dict) and key in existing:
                existing[key].update(value)
            else:
                existing[key] = value

        await db.execute(
            "UPDATE cases SET data = ?, updated_at = datetime('now') WHERE id = ?",
            (json.dumps(existing, ensure_ascii=False), caso_id),
        )
        await db.commit()
        return {"status": "updated", "id": caso_id}
    finally:
        await db.close()


@router.delete("/{caso_id}", response_model=dict)
async def delete_case(caso_id: str):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT id FROM cases WHERE id = ?", (caso_id,))
        if not rows:
            raise HTTPException(status_code=404, detail=f"Caso '{caso_id}' não encontrado.")
        await db.execute("DELETE FROM cases WHERE id = ?", (caso_id,))
        await db.commit()
        return {"status": "deleted", "id": caso_id}
    finally:
        await db.close()


@router.get("/{caso_id}/flashcards", response_model=List[dict])
async def get_flashcards(caso_id: str):
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT data FROM cases WHERE id = ?", (caso_id,)
        )
        if not rows:
            raise HTTPException(status_code=404, detail=f"Caso '{caso_id}' não encontrado.")
        data = json.loads(rows[0]["data"])
        return data.get("flashcards", [])
    finally:
        await db.close()
