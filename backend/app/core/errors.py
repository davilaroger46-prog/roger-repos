from fastapi import HTTPException


def not_found(entity: str = "Recurso") -> HTTPException:
    return HTTPException(status_code=404, detail=f"{entity} não encontrado.")


def unauthorized(detail: str = "Não autorizado.") -> HTTPException:
    return HTTPException(status_code=401, detail=detail)


def forbidden(detail: str = "Acesso negado.") -> HTTPException:
    return HTTPException(status_code=403, detail=detail)


def bad_request(detail: str) -> HTTPException:
    return HTTPException(status_code=400, detail=detail)


def unprocessable(detail: str) -> HTTPException:
    return HTTPException(status_code=422, detail=detail)


def server_error(detail: str = "Erro interno do servidor.") -> HTTPException:
    return HTTPException(status_code=500, detail=detail)
