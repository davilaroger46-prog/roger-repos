from .conftest import client


def test_pdf_blocked_when_case_not_approved(create_user, create_case):
    owner = create_user(role="doctor")
    case = create_case(owner["user"].id)

    response = client.get(
        f"/cases/{case.id}/pdf",
        headers=owner["headers"],
    )

    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "VALIDATION_ERROR"


def test_pdf_allowed_when_case_approved(create_user, create_case, db):
    owner = create_user(role="doctor")
    case = create_case(owner["user"].id)

    case.review_status = "approved"
    db.commit()

    response = client.get(
        f"/cases/{case.id}/pdf",
        headers=owner["headers"],
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
