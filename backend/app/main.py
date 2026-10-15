"""Ponto de entrada da API.

Rodar localmente:  uvicorn app.main:app --reload
Documentação interativa: http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Cria as tabelas que ainda não existem. Para evoluir o schema depois,
    # o próximo passo natural é adotar migrações com Alembic.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Doação de Sangue — API",
    description=(
        "API REST do Sistema de Doação de Sangue. Casos de uso: UC01 visualizar e "
        "selecionar hospital, UC02 atualizar informações do hospital, UC03 visualizar "
        "campanhas, UC04 criar campanha e UC05 doação direta entre bancos de sangue."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials="*" not in settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Status"])
def status_api():
    return {"status": "ok", "docs": "/docs"}
