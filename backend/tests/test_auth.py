def test_register_login_and_me(client):
    register = client.post(
        "/api/auth/register",
        json={
            "name": "Novo Usuario",
            "email": "novo@test.com",
            "password": "12345678",
            "username": "novoteste",
        },
    )
    assert register.status_code == 201
    register_data = register.get_json()
    assert register_data["user"]["email"] == "novo@test.com"
    assert register_data["projects"] == []

    login = client.post("/api/auth/login", json={"email": "novo@test.com", "password": "12345678"})
    assert login.status_code == 200
    token = login.get_json()["access_token"]

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.get_json()["email"] == "novo@test.com"


def test_login_rejects_invalid_credentials(client, admin_user):
    response = client.post("/api/auth/login", json={"email": admin_user.email, "password": "senha-errada"})
    assert response.status_code == 401
    assert response.get_json()["message"] == "Credenciais inválidas"
