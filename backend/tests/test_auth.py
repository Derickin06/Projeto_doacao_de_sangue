SE = (-23.5503, -46.6339)


def _cadastro(email="rep@hosp.com", senha="senha123"):
    return {
        "nome": "Mariana",
        "email": email,
        "senha": senha,
        "hospital": {"nome": "Hospital A", "endereco": "Rua A, 100 - São Paulo"},
    }


def test_cadastro_e_login_representante(client):
    r = client.post("/auth/representantes", json=_cadastro(email="Rep@Hosp.com"))
    assert r.status_code == 201
    corpo = r.json()
    assert corpo["email"] == "rep@hosp.com"
    assert corpo["hospital"]["nome"] == "Hospital A"
    assert "senha" not in corpo and "senha_hash" not in corpo

    r = client.post("/auth/login", json={"email": "rep@hosp.com", "senha": "senha123"})
    assert r.status_code == 200
    token = r.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["hospital"]["nome"] == "Hospital A"


def test_email_duplicado(client, criar_representante):
    criar_representante("rep@hosp.com", "Hospital A", *SE)
    assert client.post("/auth/representantes", json=_cadastro()).status_code == 409


def test_login_senha_errada(client, criar_representante):
    criar_representante("rep@hosp.com", "Hospital A", *SE)
    r = client.post("/auth/login", json={"email": "rep@hosp.com", "senha": "errada"})
    assert r.status_code == 401
    r = client.post("/auth/login", json={"email": "ninguem@hosp.com", "senha": "senha123"})
    assert r.status_code == 401


def test_validacoes_de_cadastro(client):
    assert client.post("/auth/representantes", json=_cadastro(email="nao-e-email")).status_code == 422
    assert client.post("/auth/representantes", json=_cadastro(senha="123")).status_code == 422
