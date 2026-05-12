from fastapi import HTTPException


MIN_PASSWORD_LENGTH = 8


def validate_password(password: str) -> None:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"A senha deve ter no mínimo {MIN_PASSWORD_LENGTH} caracteres.",
        )

    if not any(c.isdigit() for c in password):
        raise HTTPException(
            status_code=400,
            detail="A senha deve conter ao menos um número.",
        )

    if not any(c.isupper() for c in password):
        raise HTTPException(
            status_code=400,
            detail="A senha deve conter ao menos uma letra maiúscula.",
        )
