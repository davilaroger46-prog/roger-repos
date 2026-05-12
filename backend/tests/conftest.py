import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal
from app.models.user_model import UserModel
from app.models.case_model import ClinicalCaseModel
from app.services.auth_service import hash_password
from tests.fixtures import valid_clinical_case


client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()

    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def create_user(db):
    def _create_user(role="doctor"):
        email = f"user_{uuid.uuid4().hex}@test.com"

        user = UserModel(
            name="Test User",
            email=email,
            hashed_password=hash_password("StrongPassword123!"),
            role=role,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        login = client.post(
            "/auth/login",
            json={
                "email": email,
                "password": "StrongPassword123!",
            },
        )

        token = login.json()["access_token"]

        return {
            "user": user,
            "token": token,
            "headers": {
                "Authorization": f"Bearer {token}",
            },
        }

    return _create_user


@pytest.fixture
def create_case(db):
    def _create_case(user_id):
        case_json = valid_clinical_case()

        case = ClinicalCaseModel(
            user_id=user_id,
            titulo=case_json["meta"]["titulo"],
            regiao=case_json["meta"]["regiao"],
            nivel=case_json["meta"]["nivel"],
            ao_codigo=case_json["classificacao"]["ao_ota"]["codigo"],
            caso_json=case_json,
        )

        db.add(case)
        db.commit()
        db.refresh(case)

        return case

    return _create_case
