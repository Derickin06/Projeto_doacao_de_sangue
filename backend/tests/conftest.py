"""Fixtures dos testes de API: banco SQLite em memória, isolado a cada teste."""

from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Sessao = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def get_db_teste():
        db = Sessao()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = get_db_teste
    # Sem "with": o lifespan (create_all no banco real) não roda nos testes.
    yield TestClient(app)
    app.dependency_overrides.clear()
    engine.dispose()


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _login(client: TestClient, email: str, senha: str = "senha123") -> dict:
    r = client.post("/auth/login", json={"email": email, "senha": senha})
    assert r.status_code == 200, r.text
    return _auth(r.json()["access_token"])


@pytest.fixture
def criar_representante(client):
    """Cria representante + hospital e devolve (headers de auth, dados do hospital)."""

    def _criar(email: str, nome_hospital: str, lat: float, lng: float, estoque=None):
        r = client.post(
            "/auth/representantes",
            json={
                "nome": f"Rep {nome_hospital}",
                "email": email,
                "senha": "senha123",
                "hospital": {
                    "nome": nome_hospital,
                    "endereco": f"Rua do {nome_hospital}, 100 - São Paulo",
                    "horario_funcionamento": "Seg a Sex, 8h às 17h",
                    "latitude": lat,
                    "longitude": lng,
                },
            },
        )
        assert r.status_code == 201, r.text
        headers = _login(client, email)
        if estoque:
            r2 = client.put("/hospitais/me/estoque", json=estoque, headers=headers)
            assert r2.status_code == 200, r2.text
        return headers, r.json()["hospital"]

    return _criar


@pytest.fixture
def datas():
    hoje = date.today()
    return {
        "hoje": hoje.isoformat(),
        "amanha": (hoje + timedelta(days=1)).isoformat(),
        "semana_que_vem": (hoje + timedelta(days=7)).isoformat(),
        "ontem": (hoje - timedelta(days=1)).isoformat(),
        "mes_passado": (hoje - timedelta(days=30)).isoformat(),
    }
