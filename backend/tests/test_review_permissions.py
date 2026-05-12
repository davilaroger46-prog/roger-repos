from .conftest import client


def test_doctor_can_submit_own_case_for_review(create_user, create_case):
    doctor = create_user()
    case = create_case(doctor["user"].id)

    response = client.post(
        f"/cases/{case.id}/submit-review",
        headers=doctor["headers"],
    )

    assert response.status_code == 200
    assert response.json()["review_status"] == "review_pending"


def test_doctor_cannot_submit_other_case_for_review(create_user, create_case):
    owner = create_user()
    outsider = create_user()
    case = create_case(owner["user"].id)

    response = client.post(
        f"/cases/{case.id}/submit-review",
        headers=outsider["headers"],
    )

    assert response.status_code == 404


def test_reviewer_can_approve_pending_case(create_user, create_case, db):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    case.review_status = "review_pending"
    db.commit()

    response = client.post(
        f"/cases/{case.id}/review",
        headers=reviewer["headers"],
        json={"status": "approved", "notes": "Aprovado."},
    )

    assert response.status_code == 200
    assert response.json()["review_status"] == "approved"


def test_reviewer_can_reject_pending_case(create_user, create_case, db):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    case.review_status = "review_pending"
    db.commit()

    response = client.post(
        f"/cases/{case.id}/review",
        headers=reviewer["headers"],
        json={"status": "rejected", "notes": "Revisar conteúdo."},
    )

    assert response.status_code == 200
    assert response.json()["review_status"] == "rejected"


def test_reviewer_cannot_review_draft(create_user, create_case):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    response = client.post(
        f"/cases/{case.id}/review",
        headers=reviewer["headers"],
        json={"status": "approved", "notes": ""},
    )

    assert response.status_code == 400


def test_doctor_cannot_review_case(create_user, create_case, db):
    doctor = create_user()
    case = create_case(doctor["user"].id)

    case.review_status = "review_pending"
    db.commit()

    response = client.post(
        f"/cases/{case.id}/review",
        headers=doctor["headers"],
        json={"status": "approved", "notes": ""},
    )

    assert response.status_code in [401, 403]


def test_reviewer_sees_pending_queue(create_user, create_case, db):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    case.review_status = "review_pending"
    db.commit()

    response = client.get(
        "/cases/",
        params={"review_status": "review_pending"},
        headers=reviewer["headers"],
    )

    assert response.status_code == 200
    ids = [c["id"] for c in response.json()["items"]]
    assert case.id in ids


def test_reviewer_does_not_see_drafts(create_user, create_case):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    response = client.get(
        "/cases/",
        headers=reviewer["headers"],
    )

    assert response.status_code == 200
    ids = [c["id"] for c in response.json()["items"]]
    assert case.id not in ids


def test_reviewer_can_open_pending_case(create_user, create_case, db):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    case.review_status = "review_pending"
    db.commit()

    response = client.get(
        f"/cases/{case.id}",
        headers=reviewer["headers"],
    )

    assert response.status_code == 200
    assert response.json()["_db"]["review_status"] == "review_pending"


def test_approved_case_cannot_be_reviewed_again(create_user, create_case, db):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    case.review_status = "approved"
    db.commit()

    response = client.post(
        f"/cases/{case.id}/review",
        headers=reviewer["headers"],
        json={"status": "rejected", "notes": "Tentativa dupla."},
    )

    assert response.status_code == 400
