"""Configurações da aplicação, lidas de variáveis de ambiente (ou do arquivo .env)."""

import os
from dataclasses import dataclass, field

try:  # python-dotenv é opcional: se estiver instalado, carrega o .env
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:  # pragma: no cover
    pass


def _lista(valor: str) -> list[str]:
    return [item.strip() for item in valor.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    # Ex.: mysql+pymysql://usuario:senha@localhost:3306/doacao_sangue
    # Sem DATABASE_URL, usa um SQLite local (útil para desenvolvimento rápido).
    database_url: str = field(
        default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./doacao_sangue.db")
    )
    jwt_secret: str = field(
        default_factory=lambda: os.getenv("JWT_SECRET", "chave-de-desenvolvimento-troque-em-producao")
    )
    jwt_expira_minutos: int = field(
        default_factory=lambda: int(os.getenv("JWT_EXPIRA_MINUTOS", "720"))
    )
    google_maps_api_key: str | None = field(
        default_factory=lambda: os.getenv("GOOGLE_MAPS_API_KEY") or None
    )
    cors_origins: list[str] = field(
        default_factory=lambda: _lista(os.getenv("CORS_ORIGINS", "*"))
    )


settings = Settings()
