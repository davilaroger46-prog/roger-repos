import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_user_returns_token():
    email = f"user_{uuid.uuid4().hex}@test.com"

    response = client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "email": email,
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_user_returns_token():
    email = f"user_{uuid.uuid4().hex}@test.com"
    password = "StrongPassword123!"

    client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "email": email,
            "password": password,
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_cases_with_token_is_authorized():
    email = f"user_{uuid.uuid4().hex}@test.com"
    password = "StrongPassword123!"

    register = client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "email": email,
            "password": password,
        },
    )

    token = register.json()["access_token"]

    response = client.get(
        "/cases/",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200
