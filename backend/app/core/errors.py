from fastapi import HTTPException


class AppError(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: dict | None = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "code": code,
                "message": message,
                "details": details or {},
            },
        )


def not_found(message: str = "Recurso não encontrado"):
    return AppError(
        status_code=404,
        code="NOT_FOUND",
        message=message,
    )


def unauthorized(message: str = "Não autenticado"):
    return AppError(
        status_code=401,
        code="UNAUTHORIZED",
        message=message,
    )


def forbidden(message: str = "Acesso negado"):
    return AppError(
        status_code=403,
        code="FORBIDDEN",
        message=message,
    )


def validation_error(message: str, details: dict | None = None):
    return AppError(
        status_code=422,
        code="VALIDATION_ERROR",
        message=message,
        details=details,
    )


def conflict(message: str = "Conflito"):
    return AppError(
        status_code=400,
        code="CONFLICT",
        message=message,
    )


def ai_error(message: str = "Erro ao processar IA"):
    return AppError(
        status_code=502,
        code="AI_ERROR",
        message=message,
    )
