"""UC03 (visualizar campanhas) e UC04 (criar campanha)."""

ESTOQUE = [
    {"tipo_sanguineo": "O-", "quantidade": 2, "quantidade_minima": 10},
    {"tipo_sanguineo": "A-", "quantidade": 5, "quantidade_minima": 8},
]


def test_modelo_pre_carregado(client, criar_representante):
    headers, hospital = criar_representante("a@h.com", "Hospital A", estoque=ESTOQUE)
    r = client.get("/campanhas/modelo", headers=headers)
    assert r.status_code == 200
    modelo = r.json()
    assert modelo["hospital_id"] == hospital["id"]
    assert modelo["endereco"] == hospital["endereco"]
    assert modelo["tipos_necessarios"] == ["O-", "A-"]


def test_criar_campanha_usa_dados_do_hospital(client, criar_representante, datas):
    headers, hospital = criar_representante("a@h.com", "Hospital A", estoque=ESTOQUE)
    r = client.post(
        "/campanhas",
        json={
            "nome": "Junho Vermelho",
            "data_inicio": datas["hoje"],
            "data_fim": datas["semana_que_vem"],
        },
        headers=headers,
    )
    assert r.status_code == 201, r.text
    c = r.json()
    assert c["endereco"] == hospital["endereco"]
    assert c["tipos_necessarios"] == ["O-", "A-"]
    assert c["hospital_nome"] == "Hospital A"
    assert c["ativa"] is True


def test_criar_campanha_com_endereco_proprio(client, criar_representante, datas):
    headers, _ = criar_representante("a@h.com", "Hospital A")
    r = client.post(
        "/campanhas",
        json={
            "nome": "Campanha no Shopping",
            "data_inicio": datas["amanha"],
            "data_fim": datas["semana_que_vem"],
            "endereco": "Av. Paulista, 1000 - São Paulo",
            "tipos_necessarios": ["o-", "O-", "+b"],
        },
        headers=headers,
    )
    assert r.status_code == 201, r.text
    assert r.json()["endereco"].startswith("Av. Paulista")
    assert r.json()["tipos_necessarios"] == ["O-", "B+"]


def test_validacoes_de_datas(client, criar_representante, datas):
    headers, _ = criar_representante("a@h.com", "Hospital A")
    r = client.post(
        "/campanhas",
        json={"nome": "Invertida", "data_inicio": datas["semana_que_vem"], "data_fim": datas["hoje"]},
        headers=headers,
    )
    assert r.status_code == 422
    r = client.post(
        "/campanhas",
        json={"nome": "Passada", "data_inicio": datas["mes_passado"], "data_fim": datas["ontem"]},
        headers=headers,
    )
    assert r.status_code == 422


def test_criar_campanha_exige_login(client, datas):
    r = client.post(
        "/campanhas",
        json={"nome": "Sem login", "data_inicio": datas["hoje"], "data_fim": datas["amanha"]},
    )
    assert r.status_code == 401


def test_listar_e_detalhar_campanhas(client, criar_representante, datas):
    headers_rep, hospital = criar_representante("a@h.com", "Hospital A")
    for nome, inicio in (("Segunda", datas["semana_que_vem"]), ("Primeira", datas["hoje"])):
        r = client.post(
            "/campanhas",
            json={"nome": nome, "data_inicio": inicio, "data_fim": datas["semana_que_vem"]},
            headers=headers_rep,
        )
        assert r.status_code == 201

    # visualizar é público: sem cabeçalho de login
    lista = client.get("/campanhas").json()
    assert [c["nome"] for c in lista] == ["Primeira", "Segunda"]
    assert len(client.get("/campanhas", params={"hospital_id": hospital["id"]}).json()) == 2
    assert client.get("/campanhas", params={"hospital_id": 999}).json() == []

    campanha_id = lista[0]["id"]
    detalhe = client.get(f"/campanhas/{campanha_id}")
    assert detalhe.status_code == 200
    assert detalhe.json()["hospital_nome"] == "Hospital A"
    assert client.get("/campanhas/9999").status_code == 404
