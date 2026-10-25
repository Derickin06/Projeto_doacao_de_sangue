"""Hash de senhas (PBKDF2, da biblioteca padrão) e tokens JWT."""

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

import jwt

from .config import settings

_ALGORITMO_JWT = "HS256"
_ITERACOES = 240_000


def hash_senha(senha: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", senha.encode(), salt, _ITERACOES)
    return f"pbkdf2_sha256${_ITERACOES}${salt.hex()}${digest.hex()}"


def verificar_senha(senha: str, senha_hash: str) -> bool:
    try:
        algoritmo, iteracoes, salt_hex, digest_hex = senha_hash.split("$")
    except ValueError:
        return False
    if algoritmo != "pbkdf2_sha256":
        return False
    digest = hashlib.pbkdf2_hmac(
        "sha256", senha.encode(), bytes.fromhex(salt_hex), int(iteracoes)
    )
    return hmac.compare_digest(digest.hex(), digest_hex)


def criar_token(usuario_id: int) -> str:
    agora = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuario_id),
        "iat": agora,
        "exp": agora + timedelta(minutes=settings.jwt_expira_minutos),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=_ALGORITMO_JWT)


def decodificar_token(token: str) -> dict | None:
    """Retorna o payload do token, ou ``None`` se for inválido/expirado."""
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[_ALGORITMO_JWT])
    except jwt.PyJWTError:
        return None
