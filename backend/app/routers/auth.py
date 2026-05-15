import time
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user_model import UserModel
from app.schemas.auth import RegisterInput, LoginInput, TokenOutput, RefreshInput
from app.schemas.user import UserOutput
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.password_policy import validate_password_strength
from app.core.errors import conflict, unauthorized, AppError
from app.core.logging import logger
from app.deps.auth_deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

MAX_ATTEMPTS = 5
LOCKOUT_SECONDS = 15 * 60
ATTEMPT_WINDOW = 10 * 60

_failed_attempts: dict[str, list[float]] = {}


def _check_lockout(identifier: str):
    now = time.time()
    attempts = [t for t in _failed_attempts.get(identifier, []) if t > now - ATTEMPT_WINDOW]
    if len(attempts) >= MAX_ATTEMPTS:
        wait = int(LOCKOUT_SECONDS - (now - attempts[0]))
        raise AppError(
            status_code=429,
            code="ACCOUNT_LOCKED",
            message=f"Conta bloqueada por tentativas excessivas. Tente novamente em {max(wait, 1)} segundos.",
            details={"retry_after": max(wait, 1)},
        )
    _failed_attempts[identifier] = attempts


def _record_failure(identifier: str):
    _failed_attempts.setdefault(identifier, []).append(time.time())


def _clear_failures(identifier: str):
    _failed_attempts.pop(identifier, None)


@router.post("/register", response_model=TokenOutput)
def register(payload: RegisterInput, request: Request):
    ip = request.client.host
    identifier = f"register:{ip}"
    _check_lockout(identifier)

    validate_password_strength(payload.password)

    db: Session = SessionLocal()
    try:
        existing = db.query(UserModel).filter(UserModel.email == payload.email).first()
        if existing:
            _record_failure(identifier)
            raise conflict("Email já cadastrado")

        user = UserModel(
            name=payload.name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        _clear_failures(identifier)
        logger.info(f"Usuário registrado | user_id={user.id} | email={user.email}")

        token = create_access_token({"sub": str(user.id), "email": user.email})
        refresh = create_refresh_token({"sub": str(user.id), "email": user.email, "version": user.token_version})
        return {"access_token": token, "refresh_token": refresh, "token_type": "bearer"}
    finally:
        db.close()


@router.post("/login", response_model=TokenOutput)
def login(payload: LoginInput, request: Request):
    ip = request.client.host
    identifier = f"{ip}:{payload.email}"

    _check_lockout(identifier)

    db: Session = SessionLocal()
    try:
        user = db.query(UserModel).filter(UserModel.email == payload.email).first()

        if not user or not verify_password(payload.password, user.hashed_password):
            _record_failure(identifier)
            remaining = MAX_ATTEMPTS - len(_failed_attempts.get(identifier, []))
            logger.warning(f"Login falhou | email={payload.email} | ip={ip} | tentativas_restantes={max(remaining, 0)}")
            raise unauthorized("Credenciais inválidas")

        _clear_failures(identifier)
        logger.info(f"Login bem-sucedido | user_id={user.id} | email={user.email}")

        token = create_access_token({"sub": str(user.id), "email": user.email})
        refresh = create_refresh_token({"sub": str(user.id), "email": user.email, "version": user.token_version})
        return {"access_token": token, "refresh_token": refresh, "token_type": "bearer"}
    finally:
        db.close()


@router.post("/refresh", response_model=TokenOutput)
def refresh(payload: RefreshInput):
    try:
        data = decode_token(payload.refresh_token)
    except Exception:
        raise unauthorized("Refresh token inválido ou expirado")

    if data.get("type") != "refresh":
        raise unauthorized("Token inválido")

    db: Session = SessionLocal()
    try:
        user = db.query(UserModel).filter(UserModel.id == int(data["sub"])).first()
        if not user:
            raise unauthorized("Usuário não encontrado")

        if data.get("version") != user.token_version:
            raise unauthorized("Sessão revogada. Faça login novamente.")

        token = create_access_token({"sub": data["sub"], "email": data["email"]})
        refresh_token = create_refresh_token({"sub": data["sub"], "email": data["email"], "version": user.token_version})
        return {"access_token": token, "refresh_token": refresh_token, "token_type": "bearer"}
    finally:
        db.close()


@router.post("/logout")
def logout(current_user: UserModel = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        user = db.query(UserModel).filter(UserModel.id == current_user.id).first()
        if user:
            user.token_version += 1
            db.commit()
        logger.info(f"Logout | user_id={current_user.id}")
        return {"status": "logged_out"}
    finally:
        db.close()


class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
def change_password(
    payload: ChangePasswordInput,
    current_user: UserModel = Depends(get_current_user),
):
    validate_password_strength(payload.new_password)

    db: Session = SessionLocal()
    try:
        user = db.query(UserModel).filter(UserModel.id == current_user.id).first()

        if not verify_password(payload.current_password, user.hashed_password):
            raise unauthorized("Senha atual incorreta")

        user.hashed_password = hash_password(payload.new_password)
        user.token_version += 1
        db.commit()

        logger.info(f"Senha alterada | user_id={user.id}")
        return {"status": "password_changed"}
    finally:
        db.close()


@router.get("/me", response_model=UserOutput)
def me(current_user: UserModel = Depends(get_current_user)):
    return current_user
