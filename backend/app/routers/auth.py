"""Cadastro e login do representante do hospital.

O representante precisa estar logado para atualizar o hospital (UC02) e criar
campanhas (UC04). Visualizar campanhas (UC03) é público e não exige login.
"""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..deps import DB, RepresentanteAtual
from ..models import Hospital, Representante
from ..schemas import LoginEntrada, RepresentanteCriar, RepresentanteOut, Token
from ..security import criar_token, hash_senha, verificar_senha

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post(
    "/representantes", response_model=RepresentanteOut, status_code=status.HTTP_201_CREATED
)
def cadastrar_representante(dados: RepresentanteCriar, db: DB):
    """Cadastra o representante junto com o hospital que ele representa (relação 1–1)."""
    if db.scalar(select(Representante.id).where(Representante.email == dados.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "E-mail já cadastrado.")

    hospital = Hospital(**dados.hospital.model_dump())

    rep = Representante(
        nome=dados.nome, email=dados.email, senha_hash=hash_senha(dados.senha)
    )
    rep.hospital = hospital
    db.add(rep)
    db.commit()
    db.refresh(rep)
    return rep


@router.post("/login", response_model=Token)
def login(dados: LoginEntrada, db: DB):
    rep = db.scalar(select(Representante).where(Representante.email == dados.email))
    if rep is None or not verificar_senha(dados.senha, rep.senha_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "E-mail ou senha incorretos.")
    return Token(access_token=criar_token(rep.id))


@router.get("/me", response_model=RepresentanteOut)
def quem_sou_eu(rep: RepresentanteAtual):
    """Dados do representante logado e do hospital dele."""
    return rep
