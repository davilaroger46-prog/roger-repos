from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_success():
    response = client.post("/auth/register", json={
        "name": "Dr. House",
        "email": "house@orthostudy.com",
        "password": "Senha123",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_register_duplicate_email():
    payload = {
        "name": "Dr. House",
        "email": "duplicate@orthostudy.com",
        "password": "Senha123",
    }
    client.post("/auth/register", json=payload)
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "CONFLICT"


def test_register_weak_password_too_short():
    response = client.post("/auth/register", json={
        "name": "Dr. House",
        "email": "house@orthostudy.com",
        "password": "abc",
    })
    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "VALIDATION_ERROR"


def test_register_weak_password_no_number():
    response = client.post("/auth/register", json={
        "name": "Dr. House",
        "email": "house@orthostudy.com",
        "password": "SemNumero",
    })
    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "VALIDATION_ERROR"


def test_register_weak_password_no_uppercase():
    response = client.post("/auth/register", json={
        "name": "Dr. House",
        "email": "house@orthostudy.com",
        "password": "semnumero1",
    })
    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "VALIDATION_ERROR"


def test_login_success():
    client.post("/auth/register", json={
        "name": "Dr. House",
        "email": "login@orthostudy.com",
        "password": "Senha123",
    })
    response = client.post("/auth/login", json={
        "email": "login@orthostudy.com",
        "password": "Senha123",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password():
    client.post("/auth/register", json={
        "name": "Dr. House",
        "email": "wrongpass@orthostudy.com",
        "password": "Senha123",
    })
    response = client.post("/auth/login", json={
        "email": "wrongpass@orthostudy.com",
        "password": "Errada999",
    })
    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "UNAUTHORIZED"


def test_login_unknown_email():
    response = client.post("/auth/login", json={
        "email": "naoexiste@orthostudy.com",
        "password": "Senha123",
    })
    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "UNAUTHORIZED"


def test_token_grants_access():
    register = client.post("/auth/register", json={
        "name": "Dr. House",
        "email": "token@orthostudy.com",
        "password": "Senha123",
    })
    token = register.json()["access_token"]
    response = client.get("/cases/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_invalid_token_rejected():
    response = client.get("/cases/", headers={"Authorization": "Bearer token.invalido.aqui"})
    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "UNAUTHORIZED"
