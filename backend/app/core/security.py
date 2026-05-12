import re

from app.core.errors import validation_error


def validate_password_strength(password: str):
    errors = []

    if len(password) < 8:
        errors.append("A senha deve ter pelo menos 8 caracteres.")

    if not re.search(r"[A-Z]", password):
        errors.append("A senha deve conter pelo menos uma letra maiúscula.")

    if not re.search(r"[a-z]", password):
        errors.append("A senha deve conter pelo menos uma letra minúscula.")

    if not re.search(r"\d", password):
        errors.append("A senha deve conter pelo menos um número.")

    if not re.search(r"[^\w\s]", password):
        errors.append("A senha deve conter pelo menos um caractere especial.")

    if errors:
        raise validation_error(
            "Senha fraca.",
            {"password": errors},
        )
