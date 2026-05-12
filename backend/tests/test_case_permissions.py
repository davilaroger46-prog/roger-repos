from .conftest import client


def test_user_cannot_access_other_user_case(create_user, create_case):
    user_a = create_user()
    user_b = create_user()

    case = create_case(user_a["user"].id)

    response = client.get(
        f"/cases/{case.id}",
        headers=user_b["headers"],
    )

    assert response.status_code == 404


def test_user_cannot_delete_other_user_case(create_user, create_case):
    user_a = create_user()
    user_b = create_user()

    case = create_case(user_a["user"].id)

    response = client.delete(
        f"/cases/{case.id}",
        headers=user_b["headers"],
    )

    assert response.status_code == 404


def test_user_cannot_update_other_user_case(create_user, create_case):
    user_a = create_user()
    user_b = create_user()

    case = create_case(user_a["user"].id)

    response = client.put(
        f"/cases/{case.id}",
        headers=user_b["headers"],
        json=case.caso_json,
    )

    assert response.status_code == 404
