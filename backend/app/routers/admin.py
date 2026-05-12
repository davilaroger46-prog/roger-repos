from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.deps.role_deps import require_role
from app.models.user_model import UserModel
from app.schemas.user import UserOutput

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserOutput])
def list_users(
    current_user: UserModel = Depends(require_role("admin")),
):
    db: Session = SessionLocal()
    try:
        return db.query(UserModel).order_by(UserModel.id).all()
    finally:
        db.close()
