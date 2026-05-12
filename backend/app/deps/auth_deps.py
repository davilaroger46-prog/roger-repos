from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import SECRET_KEY, ALGORITHM
from app.core.errors import unauthorized
from app.db.database import SessionLocal
from app.models.user_model import UserModel

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    db: Session = SessionLocal()

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:
            raise unauthorized("Token inválido")

        user = db.query(UserModel).filter(
            UserModel.id == int(user_id)
        ).first()

        if not user:
            raise unauthorized("Usuário não encontrado")

        return user

    except JWTError:
        raise unauthorized("Token inválido ou expirado")

    finally:
        db.close()
