from fastapi import Depends

from app.core.errors import forbidden
from app.deps.auth_deps import get_current_user
from app.models.user_model import UserModel


def require_role(*allowed_roles: str):
    def checker(
        current_user: UserModel = Depends(get_current_user),
    ):
        if current_user.role not in allowed_roles:
            raise forbidden("Usuário sem permissão para esta ação")

        return current_user

    return checker
