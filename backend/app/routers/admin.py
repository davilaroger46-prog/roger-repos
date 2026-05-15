import os
from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.deps.role_deps import require_role
from app.models.case_model import ClinicalCaseModel
from app.models.user_model import UserModel
from app.services.audit_service import log_action
from app.core.errors import not_found, validation_error, forbidden
from app.core.logging import logger

router = APIRouter(prefix="/admin", tags=["Admin"])

VALID_ROLES = {"doctor", "reviewer", "admin"}


@router.post("/bootstrap")
def bootstrap_admin(
    email: str,
    x_bootstrap_secret: str = Header(..., alias="X-Bootstrap-Secret"),
):
    """Promotes the first admin. Locked once any admin already exists."""
    secret = os.getenv("BOOTSTRAP_SECRET", "")
    if not secret or x_bootstrap_secret != secret:
        raise forbidden("Secret inválido")

    db: Session = SessionLocal()
    try:
        existing_admin = db.query(UserModel).filter(UserModel.role == "admin").first()
        if existing_admin:
            raise forbidden("Já existe um admin. Bootstrap desativado.")

        user = db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            raise not_found("Usuário não encontrado")

        user.role = "admin"
        db.commit()
        logger.info(f"Bootstrap admin | user_id={user.id} email={user.email}")
        return {"message": "Usuário promovido a admin", "id": user.id, "email": user.email}
    finally:
        db.close()


class RoleUpdate(BaseModel):
    role: str


@router.get("/stats")
def admin_stats(_=Depends(require_role("admin"))):
    db: Session = SessionLocal()
    try:
        total_users = db.query(func.count(UserModel.id)).scalar()
        total_cases = db.query(func.count(ClinicalCaseModel.id)).scalar()

        by_status = dict(
            db.query(ClinicalCaseModel.review_status, func.count(ClinicalCaseModel.id))
            .group_by(ClinicalCaseModel.review_status)
            .all()
        )

        by_role = dict(
            db.query(UserModel.role, func.count(UserModel.id))
            .group_by(UserModel.role)
            .all()
        )

        recent_users = (
            db.query(UserModel)
            .order_by(UserModel.created_at.desc())
            .limit(5)
            .all()
        )

        return {
            "total_users": total_users,
            "total_cases": total_cases,
            "by_status": by_status,
            "by_role": by_role,
            "recent_users": [
                {"id": u.id, "name": u.name, "email": u.email, "role": u.role,
                 "created_at": u.created_at.isoformat() if u.created_at else None}
                for u in recent_users
            ],
        }
    finally:
        db.close()


@router.get("/users")
def list_users(
    page: int = 1,
    page_size: int = 20,
    q: str | None = None,
    role: str | None = None,
    _=Depends(require_role("admin")),
):
    db: Session = SessionLocal()
    try:
        query = db.query(UserModel)

        if q:
            term = f"%{q}%"
            query = query.filter(
                UserModel.name.ilike(term) | UserModel.email.ilike(term)
            )

        if role:
            query = query.filter(UserModel.role == role)

        total = query.count()
        users = (
            query.order_by(UserModel.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        user_ids = [u.id for u in users]
        case_counts = dict(
            db.query(ClinicalCaseModel.user_id, func.count(ClinicalCaseModel.id))
            .filter(ClinicalCaseModel.user_id.in_(user_ids))
            .group_by(ClinicalCaseModel.user_id)
            .all()
        ) if user_ids else {}

        return {
            "items": [
                {
                    "id": u.id,
                    "name": u.name,
                    "email": u.email,
                    "role": u.role,
                    "created_at": u.created_at.isoformat() if u.created_at else None,
                    "case_count": case_counts.get(u.id, 0),
                }
                for u in users
            ],
            "total": total,
            "page": page,
            "pages": max(1, -(-total // page_size)),
        }
    finally:
        db.close()


@router.post("/seed-demo")
def seed_demo_cases(
    target_user_id: int | None = None,
    current_admin=Depends(require_role("admin")),
):
    from app.data.demo_cases import DEMO_CASES

    db: Session = SessionLocal()
    try:
        owner_id = target_user_id or current_admin.id

        inserted_cases = []
        for case_data in DEMO_CASES:
            new_case = ClinicalCaseModel(
                user_id=owner_id,
                titulo=case_data["meta"]["titulo"],
                regiao=case_data["meta"].get("regiao", ""),
                nivel=case_data["meta"].get("nivel", ""),
                ao_codigo=case_data["meta"].get("ao_codigo", ""),
                review_status="approved",
                caso_json=case_data,
            )
            db.add(new_case)
            inserted_cases.append(new_case)

        db.flush()

        for new_case in inserted_cases:
            log_action(db, action="case.demo_seeded", resource_type="case", user_id=current_admin.id, resource_id=new_case.id)

        db.commit()
        logger.info(f"Demo cases inseridos | admin_id={current_admin.id} user_id={owner_id} count={len(inserted_cases)}")
        return {"inserted": len(inserted_cases), "user_id": owner_id}
    finally:
        db.close()


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: RoleUpdate,
    current_admin=Depends(require_role("admin")),
):
    if payload.role not in VALID_ROLES:
        raise validation_error(f"Role inválida. Valores aceitos: {', '.join(VALID_ROLES)}")

    db: Session = SessionLocal()
    try:
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise not_found("Usuário não encontrado")

        old_role = user.role
        user.role = payload.role
        log_action(
            db,
            action="user.role_changed",
            resource_type="user",
            user_id=current_admin.id,
            resource_id=user_id,
            after={"old_role": old_role, "new_role": payload.role},
        )
        db.commit()

        logger.info(
            f"Role atualizada | admin_id={current_admin.id} "
            f"user_id={user_id} {old_role}→{payload.role}"
        )

        return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    finally:
        db.close()
