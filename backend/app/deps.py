"""Dependências do FastAPI: sessão do banco e representante autenticado."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import Hospital, Representante
from .security import decodificar_token

DB = Annotated[Session, Depends(get_db)]

_bearer = HTTPBearer(auto_error=False)


def get_representante_atual(
    credenciais: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: DB,
) -> Representante:
    if credenciais is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Faça login para continuar.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decodificar_token(credenciais.credentials)
    if payload is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Sessão inválida ou expirada.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    rep = db.get(Representante, int(payload["sub"]))
    if rep is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuário não encontrado.")
    return rep


RepresentanteAtual = Annotated[Representante, Depends(get_representante_atual)]


def get_hospital_do_representante(rep: RepresentanteAtual) -> Hospital:
    if rep.hospital is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Representante sem hospital vinculado.")
    return rep.hospital


HospitalDoRepresentante = Annotated[Hospital, Depends(get_hospital_do_representante)]
