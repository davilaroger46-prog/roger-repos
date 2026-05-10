from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models import ProgressUpdate, ProgressResponse

router = APIRouter()


@router.get("/", response_model=list)
async def list_progress():
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT * FROM progress ORDER BY ultima_atividade DESC")
        return [dict(r) for r in rows]
    finally:
        await db.close()


@router.get("/{caso_id}", response_model=ProgressResponse)
async def get_progress(caso_id: str):
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT * FROM progress WHERE caso_id = ?", (caso_id,)
        )
        if not rows:
            return ProgressResponse(
                caso_id=caso_id,
                flashcards_vistos=0,
                flashcards_corretos=0,
                decisoes_acertadas=0,
                decisoes_total=0,
            )
        return ProgressResponse(**dict(rows[0]))
    finally:
        await db.close()


@router.post("/", response_model=dict)
async def update_progress(payload: ProgressUpdate):
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT * FROM progress WHERE caso_id = ?", (payload.caso_id,)
        )

        if not rows:
            await db.execute(
                """INSERT INTO progress
                   (caso_id, flashcards_vistos, flashcards_corretos,
                    decisoes_acertadas, decisoes_total, ultima_atividade)
                   VALUES (?, ?, ?, ?, ?, datetime('now'))""",
                (
                    payload.caso_id,
                    payload.flashcards_vistos or 0,
                    payload.flashcards_corretos or 0,
                    1 if payload.decisao_acertada else 0,
                    1 if payload.decisao_acertada is not None else 0,
                ),
            )
        else:
            current = dict(rows[0])
            decisoes_acertadas = current["decisoes_acertadas"] + (1 if payload.decisao_acertada else 0)
            decisoes_total = current["decisoes_total"] + (1 if payload.decisao_acertada is not None else 0)
            await db.execute(
                """UPDATE progress SET
                   flashcards_vistos   = flashcards_vistos + ?,
                   flashcards_corretos = flashcards_corretos + ?,
                   decisoes_acertadas  = ?,
                   decisoes_total      = ?,
                   ultima_atividade    = datetime('now')
                   WHERE caso_id = ?""",
                (
                    payload.flashcards_vistos or 0,
                    payload.flashcards_corretos or 0,
                    decisoes_acertadas,
                    decisoes_total,
                    payload.caso_id,
                ),
            )

        await db.commit()
        return {"status": "ok", "caso_id": payload.caso_id}
    finally:
        await db.close()
