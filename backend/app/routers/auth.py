from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user_model import UserModel
from app.schemas.auth import RegisterInput, LoginInput, TokenOutput
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.core.security import validate_password
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post("/register", response_model=TokenOutput)
def register(payload: RegisterInput):
    validate_password(payload.password)

    db: Session = SessionLocal()

    existing = db.query(UserModel).filter(
        UserModel.email == payload.email
    ).first()

    if existing:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Email já cadastrado",
        )

    user = UserModel(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    logger.info("register user_id=%s email=%s", user.id, user.email)

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/login", response_model=TokenOutput)
def login(payload: LoginInput):
    db: Session = SessionLocal()

    user = db.query(UserModel).filter(
        UserModel.email == payload.email
    ).first()

    if not user:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Credenciais inválidas",
        )

    valid = verify_password(
        payload.password,
        user.hashed_password,
    )

    if not valid:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Credenciais inválidas",
        )

    db.close()

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
    }
