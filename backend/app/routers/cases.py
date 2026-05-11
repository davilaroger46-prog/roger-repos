from fastapi import APIRouter, HTTPException
from sqlalchemy import or_
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.case_model import ClinicalCaseModel
from app.models.case_version_model import ClinicalCaseVersionModel
from app.schemas.case import ClinicalCase
from app.services.pdf_service import generate_case_pdf
from app.core.slugify import slugify

router = APIRouter(prefix="/cases", tags=["Cases"])


def _get_case_or_404(db: Session, case_id: int) -> ClinicalCaseModel:
    case = db.query(ClinicalCaseModel).filter(ClinicalCaseModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Caso {case_id} não encontrado.")
    return case


@router.get("/")
def list_cases(
    q: str | None = None,
    regiao: str | None = None,
    nivel: str | None = None,
    conduta: str | None = None,
):
    db: Session = SessionLocal()

    query = db.query(ClinicalCaseModel)

    if q:
        query = query.filter(
            or_(
                ClinicalCaseModel.titulo.ilike(f"%{q}%"),
                ClinicalCaseModel.regiao.ilike(f"%{q}%"),
                ClinicalCaseModel.ao_codigo.ilike(f"%{q}%"),
            )
        )

    if regiao:
        query = query.filter(
            ClinicalCaseModel.regiao == regiao
        )

    if nivel:
        query = query.filter(
            ClinicalCaseModel.nivel == nivel
        )

    cases = query.order_by(
        ClinicalCaseModel.id.desc()
    ).all()

    result = []

    for case in cases:
        case_json = case.caso_json or {}

        diagnostico = case_json.get("diagnostico", {}).get("principal", "")
        resumo = case_json.get("output_app", {}).get("resumo", "")
        conduta_json = case_json.get("decisao_clinica", {}).get("output", {}).get("conduta")

        if conduta and conduta_json != conduta:
            continue

        result.append({
            "id": case.id,
            "titulo": case.titulo,
            "regiao": case.regiao,
            "nivel": case.nivel,
            "ao_codigo": case.ao_codigo,
            "conduta": conduta_json,
            "diagnostico": diagnostico,
            "resumo": resumo,
        })

    db.close()

    return result


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

        version = ClinicalCaseVersionModel(
            case_id=case_db.id,
            action="before_update",
            caso_json=case_db.caso_json,
        )

        db.add(version)

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


@router.get("/{case_id}/versions")
def list_case_versions(case_id: int):
    db: Session = SessionLocal()

    versions = db.query(ClinicalCaseVersionModel).filter(
        ClinicalCaseVersionModel.case_id == case_id
    ).order_by(
        ClinicalCaseVersionModel.id.desc()
    ).all()

    result = [
        {
            "id": v.id,
            "case_id": v.case_id,
            "action": v.action,
            "created_at": v.created_at,
        }
        for v in versions
    ]

    db.close()

    return result


@router.get("/{case_id}/versions/{version_id}")
def get_case_version(case_id: int, version_id: int):
    db: Session = SessionLocal()

    version = db.query(ClinicalCaseVersionModel).filter(
        ClinicalCaseVersionModel.case_id == case_id,
        ClinicalCaseVersionModel.id == version_id,
    ).first()

    db.close()

    if not version:
        raise HTTPException(
            status_code=404,
            detail="Versão não encontrada"
        )

    return version.caso_json


@router.post("/{case_id}/versions/{version_id}/restore")
def restore_case_version(case_id: int, version_id: int):
    db: Session = SessionLocal()

    case_db = db.query(ClinicalCaseModel).filter(
        ClinicalCaseModel.id == case_id
    ).first()

    if not case_db:
        db.close()
        raise HTTPException(status_code=404, detail="Caso não encontrado")

    version = db.query(ClinicalCaseVersionModel).filter(
        ClinicalCaseVersionModel.case_id == case_id,
        ClinicalCaseVersionModel.id == version_id,
    ).first()

    if not version:
        db.close()
        raise HTTPException(status_code=404, detail="Versão não encontrada")

    try:
        backup = ClinicalCaseVersionModel(
            case_id=case_db.id,
            action="before_restore",
            caso_json=case_db.caso_json,
        )

        db.add(backup)

        restored = ClinicalCase.model_validate(version.caso_json)

        case_json = restored.model_dump(
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
            detail=f"Erro ao restaurar versão: {str(e)}"
        )

    finally:
        db.close()


@router.get("/{case_id}/pdf")
def export_case_pdf(case_id: int):
    db: Session = SessionLocal()

    case_db = db.query(ClinicalCaseModel).filter(
        ClinicalCaseModel.id == case_id
    ).first()

    db.close()

    if not case_db:
        raise HTTPException(
            status_code=404,
            detail="Caso não encontrado"
        )

    pdf_buffer = generate_case_pdf(case_db.caso_json)

    titulo = case_db.titulo or f"caso-{case_id}"
    filename = f"orthostudy-{case_id}-{slugify(titulo)}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


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
