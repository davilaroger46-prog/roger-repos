from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user_model import UserModel
from app.schemas.auth import RegisterInput, LoginInput, TokenOutput
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.core.password_policy import validate_password_strength
from app.core.errors import conflict, unauthorized
from app.core.logging import logger
from app.deps.auth_deps import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post("/register", response_model=TokenOutput)
def register(payload: RegisterInput):
    validate_password_strength(payload.password)

    db: Session = SessionLocal()

    existing = db.query(UserModel).filter(
        UserModel.email == payload.email
    ).first()

    if existing:
        db.close()
        raise conflict("Email já cadastrado")

    user = UserModel(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    logger.info(f"Usuário registrado | user_id={user.id} | email={user.email}")

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
        raise unauthorized("Credenciais inválidas")

    valid = verify_password(
        payload.password,
        user.hashed_password,
    )

    if not valid:
        db.close()
        raise unauthorized("Credenciais inválidas")

    db.close()

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/me")
def me(current_user: UserModel = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }
