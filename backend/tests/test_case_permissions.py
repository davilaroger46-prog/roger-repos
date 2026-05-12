from .conftest import client
from tests.fixtures import valid_clinical_case


def test_owner_can_access_own_case(create_user, create_case):
    user = create_user()
    case = create_case(user["user"].id)

    response = client.get(
        f"/cases/{case.id}",
        headers=user["headers"],
    )

    assert response.status_code == 200
    data = response.json()

    assert data["meta"]["titulo"] == "Fratura do rádio distal AO 23-C2"
    assert data["_db"]["id"] == case.id


def test_owner_can_update_own_case(create_user, create_case):
    user = create_user()
    case = create_case(user["user"].id)

    payload = valid_clinical_case()
    payload["meta"]["titulo"] = "Fratura do rádio distal revisada"

    response = client.put(
        f"/cases/{case.id}",
        headers=user["headers"],
        json=payload,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["meta"]["titulo"] == "Fratura do rádio distal revisada"


def test_other_user_cannot_access_case(create_user, create_case):
    owner = create_user()
    outsider = create_user()

    case = create_case(owner["user"].id)

    response = client.get(
        f"/cases/{case.id}",
        headers=outsider["headers"],
    )

    assert response.status_code == 404


def test_other_user_cannot_update_case(create_user, create_case):
    owner = create_user()
    outsider = create_user()

    case = create_case(owner["user"].id)

    payload = valid_clinical_case()
    payload["meta"]["titulo"] = "Tentativa indevida"

    response = client.put(
        f"/cases/{case.id}",
        headers=outsider["headers"],
        json=payload,
    )

    assert response.status_code == 404


def test_other_user_cannot_delete_case(create_user, create_case):
    owner = create_user()
    outsider = create_user()

    case = create_case(owner["user"].id)

    response = client.delete(
        f"/cases/{case.id}",
        headers=outsider["headers"],
    )

    assert response.status_code == 404


def test_owner_can_delete_own_case(create_user, create_case):
    owner = create_user()

    case = create_case(owner["user"].id)

    response = client.delete(
        f"/cases/{case.id}",
        headers=owner["headers"],
    )

    assert response.status_code == 200
