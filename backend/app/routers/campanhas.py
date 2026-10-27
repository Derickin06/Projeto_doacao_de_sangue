"""UC03 — Visualizar campanhas; UC04 — Criar campanha."""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..deps import DB, HospitalDoRepresentante, RepresentanteAtual
from ..models import Campanha
from ..schemas import CampanhaCriar, CampanhaModelo, CampanhaOut

router = APIRouter(prefix="/campanhas", tags=["Campanhas"])


def _para_saida(c: Campanha) -> CampanhaOut:
    return CampanhaOut(
        id=c.id,
        nome=c.nome,
        descricao=c.descricao,
        data_inicio=c.data_inicio,
        data_fim=c.data_fim,
        endereco=c.endereco,
        tipos_necessarios=c.lista_tipos_necessarios,
        hospital_id=c.hospital_id,
        hospital_nome=c.hospital.nome,
        ativa=c.data_fim >= date.today(),
    )


def _buscar(db: DB, campanha_id: int) -> Campanha:
    campanha = db.get(Campanha, campanha_id)
    if campanha is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Campanha não encontrada.")
    return campanha


@router.get("", response_model=list[CampanhaOut])
def listar_campanhas(
    db: DB,
    ativas: Annotated[bool, Query(description="Só campanhas que ainda não terminaram")] = True,
    hospital_id: int | None = None,
):
    """UC03 — lista de campanhas (público), da que começa primeiro para a mais distante."""
    consulta = (
        select(Campanha)
        .options(selectinload(Campanha.hospital))
        .order_by(Campanha.data_inicio, Campanha.id)
    )
    if ativas:
        consulta = consulta.where(Campanha.data_fim >= date.today())
    if hospital_id is not None:
        consulta = consulta.where(Campanha.hospital_id == hospital_id)
    return [_para_saida(c) for c in db.scalars(consulta).all()]


@router.get("/modelo", response_model=CampanhaModelo)
def modelo_de_campanha(hospital: HospitalDoRepresentante):
    """UC04 — dados base pré-carregados do hospital para o formulário de nova campanha."""
    return CampanhaModelo(
        hospital_id=hospital.id,
        hospital_nome=hospital.nome,
        endereco=hospital.endereco,
        tipos_necessarios=hospital.tipos_em_falta,
    )


@router.post("", response_model=CampanhaOut, status_code=status.HTTP_201_CREATED)
def criar_campanha(
    dados: CampanhaCriar, rep: RepresentanteAtual, hospital: HospitalDoRepresentante, db: DB
):
    """UC04 — cria campanha. Endereço e tipos omitidos são preenchidos com os do hospital."""
    if dados.data_fim < date.today():
        raise HTTPException(422, "A campanha não pode terminar no passado.")

    endereco = dados.endereco or hospital.endereco
    tipos = dados.tipos_necessarios or hospital.tipos_em_falta

    campanha = Campanha(
        nome=dados.nome,
        descricao=dados.descricao,
        data_inicio=dados.data_inicio,
        data_fim=dados.data_fim,
        endereco=endereco,
        tipos_necessarios=",".join(tipos),
        hospital=hospital,
        representante=rep,
    )
    db.add(campanha)
    db.commit()
    db.refresh(campanha)
    return _para_saida(campanha)


@router.get("/{campanha_id}", response_model=CampanhaOut)
def detalhar_campanha(campanha_id: int, db: DB):
    """UC03 — detalhes de uma campanha (público)."""
    return _para_saida(_buscar(db, campanha_id))
