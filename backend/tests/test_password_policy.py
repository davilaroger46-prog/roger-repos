from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_rejects_weak_password():
    response = client.post(
        "/auth/register",
        json={
            "name": "Weak User",
            "email": "weak_user@test.com",
            "password": "123",
        },
    )

    assert response.status_code == 422

    data = response.json()
    assert data["detail"]["code"] == "VALIDATION_ERROR"
