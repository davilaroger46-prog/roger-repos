from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import or_, cast, String, func
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.case_model import ClinicalCaseModel
from app.models.case_version_model import ClinicalCaseVersionModel
from app.models.case_share_model import CaseShareModel
from app.models.user_model import UserModel
from app.schemas.case import ClinicalCase
from app.schemas.review import ReviewDecisionInput
from app.services.pdf_service import generate_case_pdf
from app.core.slugify import slugify
from app.deps.auth_deps import get_current_user
from app.deps.role_deps import require_role
from app.core.errors import not_found, validation_error, conflict
from app.core.logging import logger


class ShareInput(BaseModel):
    email: EmailStr
    permission: str = "view"

router = APIRouter(prefix="/cases", tags=["Cases"])


def get_owned_case_or_404(
    db: Session,
    case_id: int,
    user_id: int,
) -> ClinicalCaseModel:
    case = db.query(ClinicalCaseModel).filter(
        ClinicalCaseModel.id == case_id,
        ClinicalCaseModel.user_id == user_id,
    ).first()

    if not case:
        raise not_found("Caso não encontrado")

    return case


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
        can_view_global_review_queue = (
            current_user.role in ["reviewer", "admin"]
            and review_status == "review_pending"
        )

        if can_view_global_review_queue:
            query = db.query(ClinicalCaseModel)
        else:
            query = db.query(ClinicalCaseModel).filter(
                ClinicalCaseModel.user_id == current_user.id
            )

        if review_status:
            query = query.filter(
                ClinicalCaseModel.review_status == review_status
            )

        if q:
            term = f"%{q.lower()}%"
            query = query.filter(
                or_(
                    ClinicalCaseModel.titulo.ilike(term),
                    ClinicalCaseModel.regiao.ilike(term),
                    ClinicalCaseModel.ao_codigo.ilike(term),
                    ClinicalCaseModel.nivel.ilike(term),
                    cast(ClinicalCaseModel.caso_json, String).ilike(term),
                )
            )

        if regiao:
            query = query.filter(ClinicalCaseModel.regiao == regiao)

        if nivel:
            query = query.filter(ClinicalCaseModel.nivel == nivel)

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

        query = query.order_by(
            sort_column.asc() if sort_dir == "asc" else sort_column.desc()
        )

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


@router.get("/stats")
def get_cases_stats(current_user: UserModel = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        query = db.query(ClinicalCaseModel).filter(ClinicalCaseModel.user_id == current_user.id)
        cases = query.all()

        by_status = {}
        by_regiao = {}
        by_nivel = {}
        by_day = {}

        for c in cases:
            by_status[c.review_status] = by_status.get(c.review_status, 0) + 1
            by_regiao[c.regiao or "—"] = by_regiao.get(c.regiao or "—", 0) + 1
            by_nivel[c.nivel or "—"] = by_nivel.get(c.nivel or "—", 0) + 1
            if c.created_at:
                day = c.created_at.strftime("%Y-%m-%d")
                by_day[day] = by_day.get(day, 0) + 1

        timeline = sorted([{"date": d, "count": n} for d, n in by_day.items()], key=lambda x: x["date"])

        return {
            "total": len(cases),
            "by_status": by_status,
            "by_regiao": by_regiao,
            "by_nivel": by_nivel,
            "timeline": timeline,
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
        case_db = get_owned_case_or_404(db=db, case_id=case_id, user_id=current_user.id)

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
        get_owned_case_or_404(db=db, case_id=case_id, user_id=current_user.id)

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
        get_owned_case_or_404(db=db, case_id=case_id, user_id=current_user.id)

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
        case_db = get_owned_case_or_404(db=db, case_id=case_id, user_id=current_user.id)

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
        case_db = get_owned_case_or_404(db=db, case_id=case_id, user_id=current_user.id)

        if case_db.review_status != "approved":
            raise validation_error(
                "Somente casos aprovados podem ser exportados como PDF.",
                {"review_status": case_db.review_status},
            )

        reviewer_name = None
        if case_db.reviewed_by:
            reviewer = db.query(UserModel).filter(UserModel.id == case_db.reviewed_by).first()
            reviewer_name = reviewer.name if reviewer else None

        titulo = case_db.titulo or f"caso-{case_id}"
        caso_json = case_db.caso_json
        reviewed_at = case_db.reviewed_at
    finally:
        db.close()

    pdf_buffer = generate_case_pdf(caso_json, reviewer_name=reviewer_name, reviewed_at=reviewed_at)
    filename = f"orthostudy-{case_id}-{slugify(titulo)}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{case_id}/pdf-draft")
def export_case_pdf_draft(
    case_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()

    case_db = get_owned_case_or_404(
        db=db,
        case_id=case_id,
        user_id=current_user.id,
    )

    titulo = case_db.titulo or f"caso-{case_id}"
    caso_json = case_db.caso_json
    db.close()

    pdf_buffer = generate_case_pdf(caso_json, draft=True)
    filename = f"orthostudy-draft-{case_id}-{slugify(titulo)}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


@router.delete("/{case_id}")
def delete_case(
    case_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        case = get_owned_case_or_404(db=db, case_id=case_id, user_id=current_user.id)
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
        case = get_owned_case_or_404(db=db, case_id=case_id, user_id=current_user.id)

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

        if case.review_status != "review_pending":
            raise conflict(
                f"Somente casos pendentes podem ser revisados. Status atual: {case.review_status}"
            )

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


@router.post("/{case_id}/share")
def share_case(
    case_id: int,
    payload: ShareInput,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        get_owned_case_or_404(db=db, case_id=case_id, user_id=current_user.id)

        target = db.query(UserModel).filter(UserModel.email == payload.email).first()
        if not target:
            raise not_found(f"Usuário '{payload.email}' não encontrado")

        if target.id == current_user.id:
            raise conflict("Você não pode compartilhar um caso com você mesmo")

        existing = db.query(CaseShareModel).filter(
            CaseShareModel.case_id == case_id,
            CaseShareModel.shared_with_id == target.id,
        ).first()

        if existing:
            existing.permission = payload.permission
            db.commit()
            return {"message": "Permissão atualizada", "shared_with": target.email}

        share = CaseShareModel(
            case_id=case_id,
            owner_id=current_user.id,
            shared_with_id=target.id,
            permission=payload.permission,
        )
        db.add(share)
        db.commit()

        logger.info(f"Caso compartilhado | case_id={case_id} | com={target.email} | perm={payload.permission}")
        return {"message": "Caso compartilhado", "shared_with": target.email, "permission": payload.permission}
    finally:
        db.close()


@router.get("/{case_id}/shares")
def list_case_shares(
    case_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        get_owned_case_or_404(db=db, case_id=case_id, user_id=current_user.id)

        shares = db.query(CaseShareModel).filter(CaseShareModel.case_id == case_id).all()

        result = []
        for s in shares:
            user = db.query(UserModel).filter(UserModel.id == s.shared_with_id).first()
            result.append({
                "id": s.id,
                "shared_with_email": user.email if user else "—",
                "shared_with_name": user.name if user else "—",
                "permission": s.permission,
                "created_at": s.created_at,
            })
        return result
    finally:
        db.close()


@router.delete("/{case_id}/shares/{share_id}")
def remove_case_share(
    case_id: int,
    share_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        get_owned_case_or_404(db=db, case_id=case_id, user_id=current_user.id)

        share = db.query(CaseShareModel).filter(
            CaseShareModel.id == share_id,
            CaseShareModel.case_id == case_id,
        ).first()

        if not share:
            raise not_found("Compartilhamento não encontrado")

        db.delete(share)
        db.commit()
        return {"status": "removed", "id": share_id}
    finally:
        db.close()
