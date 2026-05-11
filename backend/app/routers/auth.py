from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user_model import UserModel
from app.schemas.auth import RegisterInput, LoginInput, TokenOutput
from app.services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenOutput)
def register(payload: RegisterInput):
    db: Session = SessionLocal()

    try:
        existing = db.query(UserModel).filter(UserModel.email == payload.email).first()

        if existing:
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

        user = UserModel(
            name=payload.name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
        )

        db.add(user)
        db.commit()

        token = create_access_token({"sub": str(user.id), "email": user.email})

        return TokenOutput(access_token=token)

    finally:
        db.close()


@router.post("/login", response_model=TokenOutput)
def login(payload: LoginInput):
    db: Session = SessionLocal()

    try:
        user = db.query(UserModel).filter(UserModel.email == payload.email).first()

        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Credenciais inválidas.")

        token = create_access_token({"sub": str(user.id), "email": user.email})

        return TokenOutput(access_token=token)

    finally:
        db.close()
