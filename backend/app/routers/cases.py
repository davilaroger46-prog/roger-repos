from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.case_model import ClinicalCaseModel
from app.models.case_version_model import ClinicalCaseVersionModel
from app.models.user_model import UserModel
from app.schemas.case import ClinicalCase
from app.schemas.review import ReviewDecisionInput
from app.services.pdf_service import generate_case_pdf
from app.core.slugify import slugify
from app.deps.auth_deps import get_current_user
from app.deps.role_deps import require_role
from app.core.errors import not_found, validation_error
from app.core.logging import logger

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.get("/")
def list_cases(
    q: str | None = None,
    regiao: str | None = None,
    nivel: str | None = None,
    conduta: str | None = None,
    review_status: str | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        if current_user.role in ["reviewer", "admin"] and review_status == "review_pending":
            query = db.query(ClinicalCaseModel)
        else:
            query = db.query(ClinicalCaseModel).filter(
                ClinicalCaseModel.user_id == current_user.id
            )

        if q:
            query = query.filter(
                or_(
                    ClinicalCaseModel.titulo.ilike(f"%{q}%"),
                    ClinicalCaseModel.regiao.ilike(f"%{q}%"),
                    ClinicalCaseModel.ao_codigo.ilike(f"%{q}%"),
                )
            )

        if regiao:
            query = query.filter(ClinicalCaseModel.regiao == regiao)

        if nivel:
            query = query.filter(ClinicalCaseModel.nivel == nivel)

        if review_status:
            query = query.filter(ClinicalCaseModel.review_status == review_status)

        sort_map = {
            "id": ClinicalCaseModel.id,
            "titulo": ClinicalCaseModel.titulo,
            "regiao": ClinicalCaseModel.regiao,
            "nivel": ClinicalCaseModel.nivel,
            "ao_codigo": ClinicalCaseModel.ao_codigo,
            "created_at": ClinicalCaseModel.created_at,
            "updated_at": ClinicalCaseModel.updated_at,
        }

        sort_column = sort_map.get(sort_by, ClinicalCaseModel.created_at)

        if sort_dir == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        total = query.count()
        offset = (page - 1) * page_size

        cases = query.offset(offset).limit(page_size).all()

        result = []

        for case in cases:
            case_json = case.caso_json or {}

            diagnostico = case_json.get("diagnostico", {}).get("principal", "")
            resumo = case_json.get("output_app", {}).get("resumo", "")
            case_conduta = case_json.get("decisao_clinica", {}).get("output", {}).get("conduta")

            if q:
                searchable_text = " ".join([
                    case.titulo or "",
                    case.regiao or "",
                    case.ao_codigo or "",
                    diagnostico or "",
                    resumo or "",
                ]).lower()

                if q.lower() not in searchable_text:
                    continue

            if conduta and case_conduta != conduta:
                continue

            result.append({
                "id": case.id,
                "titulo": case.titulo,
                "regiao": case.regiao,
                "nivel": case.nivel,
                "ao_codigo": case.ao_codigo,
                "conduta": case_conduta,
                "diagnostico": diagnostico,
                "review_status": case.review_status,
                "review_notes": case.review_notes,
                "reviewed_by": case.reviewed_by,
                "reviewed_at": case.reviewed_at,
                "created_at": case.created_at,
                "updated_at": case.updated_at,
            })

        return {
            "items": result,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size,
        }
    finally:
        db.close()


@router.get("/{case_id}")
def get_case(
    case_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        if current_user.role in ["reviewer", "admin"]:
            case = db.query(ClinicalCaseModel).filter(
                ClinicalCaseModel.id == case_id,
            ).first()
        else:
            case = db.query(ClinicalCaseModel).filter(
                ClinicalCaseModel.id == case_id,
                ClinicalCaseModel.user_id == current_user.id,
            ).first()

        if not case:
            raise not_found("Caso não encontrado")

        data = dict(case.caso_json or {})
        data["_db"] = {
            "id": case.id,
            "user_id": case.user_id,
            "review_status": case.review_status,
            "review_notes": case.review_notes,
            "reviewed_by": case.reviewed_by,
            "reviewed_at": case.reviewed_at,
            "created_at": case.created_at,
            "updated_at": case.updated_at,
        }
        return data
    finally:
        db.close()


@router.put("/{case_id}")
def update_case(
    case_id: int,
    payload: dict,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        case_db = db.query(ClinicalCaseModel).filter(
            ClinicalCaseModel.id == case_id,
            ClinicalCaseModel.user_id == current_user.id,
        ).first()

        if not case_db:
            raise not_found("Caso não encontrado")

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

        logger.info(f"Caso atualizado | case_id={case_id} | user_id={current_user.id}")
        return case_db.caso_json

    except Exception as e:
        db.rollback()
        raise validation_error(
            "Erro de validação do caso",
            {"error": str(e)}
        )

    finally:
        db.close()


@router.get("/{case_id}/versions")
def list_case_versions(
    case_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        versions = db.query(ClinicalCaseVersionModel).filter(
            ClinicalCaseVersionModel.case_id == case_id
        ).order_by(
            ClinicalCaseVersionModel.id.desc()
        ).all()

        return [
            {
                "id": v.id,
                "case_id": v.case_id,
                "action": v.action,
                "created_at": v.created_at,
            }
            for v in versions
        ]
    finally:
        db.close()


@router.get("/{case_id}/versions/{version_id}")
def get_case_version(
    case_id: int,
    version_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        version = db.query(ClinicalCaseVersionModel).filter(
            ClinicalCaseVersionModel.case_id == case_id,
            ClinicalCaseVersionModel.id == version_id,
        ).first()

        if not version:
            raise not_found("Versão não encontrada")

        return version.caso_json
    finally:
        db.close()


@router.post("/{case_id}/versions/{version_id}/restore")
def restore_case_version(
    case_id: int,
    version_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        case_db = db.query(ClinicalCaseModel).filter(
            ClinicalCaseModel.id == case_id,
            ClinicalCaseModel.user_id == current_user.id,
        ).first()

        if not case_db:
            raise not_found("Caso não encontrado")

        version = db.query(ClinicalCaseVersionModel).filter(
            ClinicalCaseVersionModel.case_id == case_id,
            ClinicalCaseVersionModel.id == version_id,
        ).first()

        if not version:
            raise not_found("Versão não encontrada")

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

        logger.info(f"Versão restaurada | case_id={case_id} | version_id={version_id} | user_id={current_user.id}")
        return case_db.caso_json

    except Exception as e:
        db.rollback()
        raise validation_error(
            "Erro ao restaurar versão",
            {"error": str(e)}
        )

    finally:
        db.close()


@router.get("/{case_id}/pdf")
def export_case_pdf(
    case_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        case_db = db.query(ClinicalCaseModel).filter(
            ClinicalCaseModel.id == case_id,
            ClinicalCaseModel.user_id == current_user.id,
        ).first()

        if not case_db:
            raise not_found("Caso não encontrado")

        titulo = case_db.titulo or f"caso-{case_id}"
        caso_json = case_db.caso_json
    finally:
        db.close()

    pdf_buffer = generate_case_pdf(caso_json)
    filename = f"orthostudy-{case_id}-{slugify(titulo)}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.delete("/{case_id}")
def delete_case(
    case_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        case = db.query(ClinicalCaseModel).filter(
            ClinicalCaseModel.id == case_id,
            ClinicalCaseModel.user_id == current_user.id,
        ).first()
        if not case:
            raise not_found("Caso não encontrado")
        db.delete(case)
        db.commit()
        logger.info(f"Caso deletado | case_id={case_id} | user_id={current_user.id}")
        return {"status": "deleted", "id": case_id}
    finally:
        db.close()


@router.post("/{case_id}/submit-review")
def submit_case_review(
    case_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        case = db.query(ClinicalCaseModel).filter(
            ClinicalCaseModel.id == case_id,
            ClinicalCaseModel.user_id == current_user.id,
        ).first()

        if not case:
            raise not_found("Caso não encontrado")

        case.review_status = "review_pending"
        db.commit()
        db.refresh(case)

        return {
            "message": "Caso enviado para revisão",
            "review_status": case.review_status,
        }
    finally:
        db.close()


@router.post("/{case_id}/review")
def review_case(
    case_id: int,
    payload: ReviewDecisionInput,
    current_user: UserModel = Depends(require_role("reviewer", "admin")),
):
    db: Session = SessionLocal()
    try:
        case = db.query(ClinicalCaseModel).filter(
            ClinicalCaseModel.id == case_id,
        ).first()

        if not case:
            raise not_found("Caso não encontrado")

        case.review_status = payload.status
        case.review_notes = payload.notes
        case.reviewed_by = current_user.id
        case.reviewed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(case)

        return {
            "message": "Revisão registrada",
            "review_status": case.review_status,
            "review_notes": case.review_notes,
        }
    finally:
        db.close()
