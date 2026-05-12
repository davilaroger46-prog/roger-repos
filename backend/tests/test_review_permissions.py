from .conftest import client


def test_reviewer_can_see_pending_global_case(create_user, create_case, db):
    owner = create_user(role="doctor")
    reviewer = create_user(role="reviewer")

    case = create_case(owner["user"].id)
    case.review_status = "review_pending"
    db.commit()

    response = client.get(
        f"/cases/{case.id}",
        headers=reviewer["headers"],
    )

    assert response.status_code == 200
    assert response.json()["_db"]["id"] == case.id


def test_reviewer_can_approve_pending_case(create_user, create_case, db):
    owner = create_user(role="doctor")
    reviewer = create_user(role="reviewer")

    case = create_case(owner["user"].id)
    case.review_status = "review_pending"
    db.commit()

    response = client.post(
        f"/cases/{case.id}/review",
        headers=reviewer["headers"],
        json={
            "status": "approved",
            "notes": "Caso aprovado após revisão técnica.",
        },
    )

    assert response.status_code == 200
    assert response.json()["review_status"] == "approved"


def test_reviewer_cannot_edit_other_user_case(create_user, create_case, db):
    owner = create_user(role="doctor")
    reviewer = create_user(role="reviewer")

    case = create_case(owner["user"].id)
    case.review_status = "review_pending"
    db.commit()

    response = client.put(
        f"/cases/{case.id}",
        headers=reviewer["headers"],
        json=case.caso_json,
    )

    assert response.status_code == 404


def test_reviewer_cannot_delete_other_user_case(create_user, create_case, db):
    owner = create_user(role="doctor")
    reviewer = create_user(role="reviewer")

    case = create_case(owner["user"].id)
    case.review_status = "review_pending"
    db.commit()

    response = client.delete(
        f"/cases/{case.id}",
        headers=reviewer["headers"],
    )

    assert response.status_code == 404


def test_doctor_cannot_review_case(create_user, create_case, db):
    owner = create_user(role="doctor")

    case = create_case(owner["user"].id)
    case.review_status = "review_pending"
    db.commit()

    response = client.post(
        f"/cases/{case.id}/review",
        headers=owner["headers"],
        json={
            "status": "approved",
            "notes": "Tentativa indevida.",
        },
    )

    assert response.status_code in [401, 403]
