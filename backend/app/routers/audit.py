from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.audit_log_model import AuditLogModel
from app.models.case_model import ClinicalCaseModel
from app.models.user_model import UserModel
from app.deps.auth_deps import get_current_user
from app.deps.role_deps import require_role
from app.core.errors import not_found

router = APIRouter(prefix="/audit", tags=["Audit"])

ACTION_LABELS = {
    "case.generated":        {"label": "Caso gerado pela IA",        "icon": "⚡"},
    "case.updated":          {"label": "Caso editado",                "icon": "✏️"},
    "case.autocorrected":    {"label": "Autocorreção aplicada",       "icon": "🤖"},
    "case.review_submitted": {"label": "Enviado para revisão",        "icon": "📤"},
    "case.approved":         {"label": "Aprovado pelo revisor",       "icon": "✅"},
    "case.rejected":         {"label": "Rejeitado pelo revisor",      "icon": "❌"},
    "case.version_restored": {"label": "Versão restaurada",           "icon": "⏪"},
    "case.shared":           {"label": "Compartilhado",               "icon": "🔗"},
    "case.share_removed":    {"label": "Compartilhamento removido",   "icon": "🚫"},
    "case.pdf_exported":     {"label": "PDF exportado",               "icon": "📄"},
    "case.deleted":          {"label": "Caso deletado",               "icon": "🗑️"},
    "case.demo_seeded":      {"label": "Caso demo inserido",          "icon": "🌱"},
}


@router.get("/cases/{case_id}")
def get_case_timeline(
    case_id: int,
    current_user: UserModel = Depends(get_current_user),
):
    db: Session = SessionLocal()
    try:
        case = db.query(ClinicalCaseModel).filter(
            ClinicalCaseModel.id == case_id,
            ClinicalCaseModel.user_id == current_user.id,
        ).first()

        if not case and current_user.role not in ("reviewer", "admin"):
            raise not_found("Caso não encontrado")

        logs = (
            db.query(AuditLogModel)
            .filter(
                AuditLogModel.resource_type == "case",
                AuditLogModel.resource_id == case_id,
            )
            .order_by(AuditLogModel.created_at.asc())
            .all()
        )

        result = []
        for log in logs:
            meta = ACTION_LABELS.get(log.action, {"label": log.action, "icon": "•"})
            actor = None
            if log.user_id:
                u = db.query(UserModel).filter(UserModel.id == log.user_id).first()
                actor = u.name if u else f"user#{log.user_id}"

            result.append({
                "id": log.id,
                "action": log.action,
                "label": meta["label"],
                "icon": meta["icon"],
                "actor": actor,
                "ip": log.ip,
                "created_at": log.created_at.isoformat() if log.created_at else None,
                "has_diff": log.before_json is not None or log.after_json is not None,
            })

        return result
    finally:
        db.close()


@router.get("/admin/recent")
def get_recent_audit(
    limit: int = 50,
    resource_type: str | None = None,
    action: str | None = None,
    _=Depends(require_role("admin")),
):
    db: Session = SessionLocal()
    try:
        query = db.query(AuditLogModel).order_by(AuditLogModel.created_at.desc())
        if resource_type:
            query = query.filter(AuditLogModel.resource_type == resource_type)
        if action:
            query = query.filter(AuditLogModel.action == action)
        logs = query.limit(limit).all()

        result = []
        for log in logs:
            meta = ACTION_LABELS.get(log.action, {"label": log.action, "icon": "•"})
            actor = None
            if log.user_id:
                u = db.query(UserModel).filter(UserModel.id == log.user_id).first()
                actor = u.name if u else f"user#{log.user_id}"
            result.append({
                "id": log.id,
                "action": log.action,
                "label": meta["label"],
                "icon": meta["icon"],
                "actor": actor,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "ip": log.ip,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            })
        return result
    finally:
        db.close()
