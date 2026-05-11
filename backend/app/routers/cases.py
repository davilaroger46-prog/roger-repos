from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.case_model import ClinicalCaseModel
from app.schemas.case import ClinicalCase

router = APIRouter(prefix="/cases", tags=["Cases"])


def _get_case_or_404(db: Session, case_id: int) -> ClinicalCaseModel:
    case = db.query(ClinicalCaseModel).filter(ClinicalCaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Caso {case_id} não encontrado.")
    return case


@router.get("/")
def list_cases(
    regiao: Optional[str] = Query(None),
    nivel:  Optional[str] = Query(None),
    q:      Optional[str] = Query(None),
):
    db = SessionLocal()
    try:
        query = db.query(ClinicalCaseModel)

        if regiao:
            query = query.filter(ClinicalCaseModel.regiao.ilike(regiao))
        if nivel:
            query = query.filter(ClinicalCaseModel.nivel == nivel)
        if q:
            query = query.filter(ClinicalCaseModel.titulo.ilike(f"%{q}%"))

        cases = query.order_by(ClinicalCaseModel.id.desc()).all()

        return [
            {
                "id":         c.id,
                "titulo":     c.titulo,
                "regiao":     c.regiao,
                "nivel":      c.nivel,
                "ao_codigo":  c.ao_codigo,
                "meta":       c.caso_json.get("meta", {}),
                "paciente":   c.caso_json.get("paciente", {}),
                "output_app": c.caso_json.get("output_app", {}),
            }
            for c in cases
        ]
    finally:
        db.close()


@router.get("/{case_id}")
def get_case(case_id: int):
    db = SessionLocal()
    try:
        case = _get_case_or_404(db, case_id)
        return case.caso_json
    finally:
        db.close()


@router.put("/{case_id}")
def update_case(case_id: int, payload: dict):
    db: Session = SessionLocal()

    case_db = db.query(ClinicalCaseModel).filter(
        ClinicalCaseModel.id == case_id
    ).first()

    if not case_db:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Caso não encontrado"
        )

    try:
        validated = ClinicalCase.model_validate(payload)

        case_json = validated.model_dump(
            by_alias=True,
            exclude_none=True,
            mode="json",
        )

        case_db.titulo = case_json["meta"]["titulo"]
        case_db.regiao = case_json["meta"]["regiao"]
        case_db.nivel = case_json["meta"]["nivel"]
        case_db.ao_codigo = case_json["classificacao"]["ao_ota"]["codigo"]
        case_db.caso_json = case_json

        db.commit()
        db.refresh(case_db)

        return case_db.caso_json

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=422,
            detail=f"Erro de validação do caso: {str(e)}"
        )

    finally:
        db.close()


@router.delete("/{case_id}")
def delete_case(case_id: int):
    db = SessionLocal()
    try:
        case = _get_case_or_404(db, case_id)
        db.delete(case)
        db.commit()
        return {"status": "deleted", "id": case_id}
    finally:
        db.close()


@router.get("/{case_id}/flashcards")
def get_flashcards(case_id: int):
    db = SessionLocal()
    try:
        case = _get_case_or_404(db, case_id)
        return case.caso_json.get("flashcards", [])
    finally:
        db.close()
