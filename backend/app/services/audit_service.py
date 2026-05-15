from sqlalchemy.orm import Session
from app.models.audit_log_model import AuditLogModel
from app.core.logging import logger


def log_action(
    db: Session,
    action: str,
    resource_type: str,
    user_id: int | None = None,
    resource_id: int | None = None,
    before: dict | None = None,
    after: dict | None = None,
    ip: str | None = None,
):
    try:
        entry = AuditLogModel(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            before_json=before,
            after_json=after,
            ip=ip,
        )
        db.add(entry)
        # caller is responsible for commit
    except Exception as e:
        logger.warning(f"Audit log falhou | action={action} | error={e}")
