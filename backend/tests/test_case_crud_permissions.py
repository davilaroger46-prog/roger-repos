from .conftest import client
from .fixtures import valid_clinical_case


# ---------------------------------------------------------------------------
# READ
# ---------------------------------------------------------------------------

def test_doctor_can_read_own_case(create_user, create_case):
    doctor = create_user()
    case = create_case(doctor["user"].id)

    r = client.get(f"/cases/{case.id}", headers=doctor["headers"])

    assert r.status_code == 200
    assert r.json()["_db"]["id"] == case.id


def test_doctor_cannot_read_other_case(create_user, create_case):
    owner = create_user()
    other = create_user()
    case = create_case(owner["user"].id)

    r = client.get(f"/cases/{case.id}", headers=other["headers"])

    assert r.status_code == 404


def test_reviewer_can_read_pending_case(create_user, create_case, db):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    case.review_status = "review_pending"
    db.commit()

    r = client.get(f"/cases/{case.id}", headers=reviewer["headers"])

    assert r.status_code == 200
    assert r.json()["_db"]["review_status"] == "review_pending"


def test_reviewer_cannot_read_draft_of_other_user(create_user, create_case):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    r = client.get(f"/cases/{case.id}", headers=reviewer["headers"])

    assert r.status_code == 404


# ---------------------------------------------------------------------------
# UPDATE
# ---------------------------------------------------------------------------

def test_doctor_can_update_own_case(create_user, create_case):
    doctor = create_user()
    case = create_case(doctor["user"].id)
    payload = valid_clinical_case()

    r = client.put(f"/cases/{case.id}", json=payload, headers=doctor["headers"])

    assert r.status_code == 200


def test_doctor_cannot_update_other_case(create_user, create_case):
    owner = create_user()
    other = create_user()
    case = create_case(owner["user"].id)
    payload = valid_clinical_case()

    r = client.put(f"/cases/{case.id}", json=payload, headers=other["headers"])

    assert r.status_code == 404


def test_reviewer_cannot_update_other_case(create_user, create_case):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)
    payload = valid_clinical_case()

    r = client.put(f"/cases/{case.id}", json=payload, headers=reviewer["headers"])

    assert r.status_code == 404


# ---------------------------------------------------------------------------
# DELETE
# ---------------------------------------------------------------------------

def test_doctor_can_delete_own_case(create_user, create_case):
    doctor = create_user()
    case = create_case(doctor["user"].id)

    r = client.delete(f"/cases/{case.id}", headers=doctor["headers"])

    assert r.status_code == 200


def test_doctor_cannot_delete_other_case(create_user, create_case):
    owner = create_user()
    other = create_user()
    case = create_case(owner["user"].id)

    r = client.delete(f"/cases/{case.id}", headers=other["headers"])

    assert r.status_code == 404


def test_reviewer_cannot_delete_other_case(create_user, create_case):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    r = client.delete(f"/cases/{case.id}", headers=reviewer["headers"])

    assert r.status_code == 404


# ---------------------------------------------------------------------------
# LIST
# ---------------------------------------------------------------------------

def test_doctor_sees_only_own_cases(create_user, create_case):
    owner = create_user()
    other = create_user()
    own_case = create_case(owner["user"].id)
    create_case(other["user"].id)

    r = client.get("/cases/", headers=owner["headers"])

    assert r.status_code == 200
    ids = [c["id"] for c in r.json()["items"]]
    assert own_case.id in ids
    assert all(c["id"] != other["user"].id for c in r.json()["items"])


def test_reviewer_sees_pending_globally(create_user, create_case, db):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    case.review_status = "review_pending"
    db.commit()

    r = client.get(
        "/cases/",
        params={"review_status": "review_pending"},
        headers=reviewer["headers"],
    )

    assert r.status_code == 200
    ids = [c["id"] for c in r.json()["items"]]
    assert case.id in ids


def test_reviewer_does_not_see_drafts_globally(create_user, create_case):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    r = client.get("/cases/", headers=reviewer["headers"])

    assert r.status_code == 200
    ids = [c["id"] for c in r.json()["items"]]
    assert case.id not in ids


# ---------------------------------------------------------------------------
# VERSIONS
# ---------------------------------------------------------------------------

def test_doctor_can_list_own_versions(create_user, create_case):
    doctor = create_user()
    case = create_case(doctor["user"].id)

    r = client.get(f"/cases/{case.id}/versions", headers=doctor["headers"])

    assert r.status_code == 200


def test_doctor_cannot_list_other_versions(create_user, create_case):
    owner = create_user()
    other = create_user()
    case = create_case(owner["user"].id)

    r = client.get(f"/cases/{case.id}/versions", headers=other["headers"])

    assert r.status_code == 404


# ---------------------------------------------------------------------------
# SUBMIT REVIEW
# ---------------------------------------------------------------------------

def test_doctor_can_submit_own_case_for_review(create_user, create_case):
    doctor = create_user()
    case = create_case(doctor["user"].id)

    r = client.post(f"/cases/{case.id}/submit-review", headers=doctor["headers"])

    assert r.status_code == 200
    assert r.json()["review_status"] == "review_pending"


def test_doctor_cannot_submit_other_case_for_review(create_user, create_case):
    owner = create_user()
    other = create_user()
    case = create_case(owner["user"].id)

    r = client.post(f"/cases/{case.id}/submit-review", headers=other["headers"])

    assert r.status_code == 404


# ---------------------------------------------------------------------------
# REVIEW (approve / reject)
# ---------------------------------------------------------------------------

def test_reviewer_can_approve_pending_case(create_user, create_case, db):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    case.review_status = "review_pending"
    db.commit()

    r = client.post(
        f"/cases/{case.id}/review",
        json={"status": "approved", "notes": "Aprovado."},
        headers=reviewer["headers"],
    )

    assert r.status_code == 200
    assert r.json()["review_status"] == "approved"


def test_reviewer_can_reject_pending_case(create_user, create_case, db):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    case.review_status = "review_pending"
    db.commit()

    r = client.post(
        f"/cases/{case.id}/review",
        json={"status": "rejected", "notes": "Revisar conteúdo."},
        headers=reviewer["headers"],
    )

    assert r.status_code == 200
    assert r.json()["review_status"] == "rejected"


def test_reviewer_cannot_review_draft(create_user, create_case):
    doctor = create_user()
    reviewer = create_user("reviewer")
    case = create_case(doctor["user"].id)

    r = client.post(
        f"/cases/{case.id}/review",
        json={"status": "approved", "notes": ""},
        headers=reviewer["headers"],
    )

    assert r.status_code == 400


def test_doctor_cannot_review_case(create_user, create_case, db):
    doctor = create_user()
    case = create_case(doctor["user"].id)

    case.review_status = "review_pending"
    db.commit()

    r = client.post(
        f"/cases/{case.id}/review",
        json={"status": "approved", "notes": ""},
        headers=doctor["headers"],
    )

    assert r.status_code in [401, 403]
