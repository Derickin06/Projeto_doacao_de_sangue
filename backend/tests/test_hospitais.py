"""Atualizar informações do hospital."""

SE = (-23.5503, -46.6339)  # coordenadas aproximadas da Sé, São Paulo


def test_estoque_e_tipos_em_falta(client, criar_representante):
    headers, _ = criar_representante(
        "a@h.com", "Hospital A", *SE,
        estoque=[
            {"tipo_sanguineo": "O-", "quantidade": 3, "quantidade_minima": 10},
            {"tipo_sanguineo": "A+", "quantidade": 20, "quantidade_minima": 10},
            {"tipo_sanguineo": "B+", "quantidade": 8, "quantidade_minima": 10},
        ],
    )
    r = client.get("/hospitais/me", headers=headers)
    assert r.status_code == 200
    corpo = r.json()
    assert corpo["horario_funcionamento"] == "Seg a Sex, 8h às 17h"
    # Mais necessitado primeiro
    assert corpo["tipos_em_falta"] == ["O-", "B+"]
    estoque = {e["tipo_sanguineo"]: e for e in corpo["estoque"]}
    assert estoque["O-"]["necessidade"] == 7
    assert estoque["A+"]["necessidade"] == 0


def test_atualizar_informacoes_do_hospital(client, criar_representante):
    headers, hospital = criar_representante("a@h.com", "Hospital A", *SE)
    r = client.put(
        "/hospitais/me",
        json={"horario_funcionamento": "24 horas", "observacoes": "Fechado em 15/11"},
        headers=headers,
    )
    assert r.status_code == 200
    assert r.json()["horario_funcionamento"] == "24 horas"
    assert r.json()["observacoes"] == "Fechado em 15/11"
    # campos não enviados não mudam
    assert r.json()["nome"] == "Hospital A"
    assert r.json()["latitude"] == SE[0]

    r = client.get("/hospitais/me", headers=headers)
    assert r.json()["horario_funcionamento"] == "24 horas"


def test_atualizar_estoque(client, criar_representante):
    headers, _ = criar_representante("a@h.com", "Hospital A", *SE)
    r = client.put(
        "/hospitais/me/estoque",
        json=[{"tipo_sanguineo": "a-", "quantidade": 4, "quantidade_minima": 6}],
        headers=headers,
    )
    assert r.status_code == 200
    assert r.json()["estoque"][0]["tipo_sanguineo"] == "A-"

    # atualiza o mesmo tipo (não duplica)
    r = client.put(
        "/hospitais/me/estoque",
        json=[{"tipo_sanguineo": "A-", "quantidade": 9, "quantidade_minima": 6}],
        headers=headers,
    )
    assert len(r.json()["estoque"]) == 1
    assert r.json()["estoque"][0]["quantidade"] == 9
    assert r.json()["tipos_em_falta"] == []

    r = client.put(
        "/hospitais/me/estoque",
        json=[
            {"tipo_sanguineo": "A-", "quantidade": 1, "quantidade_minima": 1},
            {"tipo_sanguineo": "-A", "quantidade": 1, "quantidade_minima": 1},
        ],
        headers=headers,
    )
    assert r.status_code == 422

    r = client.put(
        "/hospitais/me/estoque",
        json=[{"tipo_sanguineo": "A-", "quantidade": -1, "quantidade_minima": 1}],
        headers=headers,
    )
    assert r.status_code == 422


def test_rotas_de_representante_protegidas(client):
    assert client.get("/hospitais/me").status_code == 401
    assert client.get("/hospitais/me", headers={"Authorization": "Bearer lixo"}).status_code == 401
    assert client.put("/hospitais/me", json={"telefone": "1"}).status_code == 401


def test_cada_representante_edita_so_o_proprio_hospital(client, criar_representante):
    headers_a, _ = criar_representante("a@h.com", "Hospital A", *SE)
    headers_b, _ = criar_representante("b@h.com", "Hospital B", *SE)
    client.put("/hospitais/me", json={"telefone": "(11) 1111-1111"}, headers=headers_a)
    assert client.get("/hospitais/me", headers=headers_b).json()["telefone"] is None
    assert client.get("/hospitais/me", headers=headers_a).json()["telefone"] == "(11) 1111-1111"
