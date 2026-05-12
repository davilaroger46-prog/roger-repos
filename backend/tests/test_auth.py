from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_cases_requires_auth():
    response = client.get("/cases/")

    assert response.status_code in [401, 403]


def test_generate_case_requires_auth():
    response = client.post(
        "/ai/generate-case",
        json={
            "tema": "Fratura do rádio distal",
            "nivel": "avancado",
            "regiao": "Punho",
        },
    )

    assert response.status_code in [401, 403]
