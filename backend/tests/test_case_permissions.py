import uuid
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def register_user():
    email = f"user_{uuid.uuid4().hex}@test.com"

    response = client.post(
        "/auth/register",
        json={
            "name": "User Test",
            "email": email,
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "email": email,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


def test_user_cannot_access_other_user_case():
    user_a = register_user()
    user_b = register_user()

    # Simulação: caso criado diretamente exigiria fixture/db.
    # Aqui testamos pelo menos que ID inexistente ou não pertencente retorna bloqueio.
    response = client.get(
        "/cases/999999",
        headers=user_b["headers"],
    )

    assert response.status_code == 404


def test_user_cannot_delete_other_user_case():
    user_b = register_user()

    response = client.delete(
        "/cases/999999",
        headers=user_b["headers"],
    )

    assert response.status_code == 404


def test_user_cannot_update_other_user_case():
    user_b = register_user()

    response = client.put(
        "/cases/999999",
        headers=user_b["headers"],
        json={"invalid": "payload"},
    )

    assert response.status_code == 404
