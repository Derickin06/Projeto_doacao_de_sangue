"""Conexão com o banco de dados (MySQL em produção, SQLite em testes/desenvolvimento)."""

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings


class Base(DeclarativeBase):
    pass


def _opcoes_engine(url: str) -> dict:
    if url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    # MySQL fecha conexões ociosas; pre_ping/recycle evitam erros de "server has gone away".
    return {"pool_pre_ping": True, "pool_recycle": 3600}


engine = create_engine(settings.database_url, **_opcoes_engine(settings.database_url))
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
