"""UC02 — Atualizar informações do hospital (horários, estoque, exceções)."""

from fastapi import APIRouter, HTTPException

from ..deps import DB, HospitalDoRepresentante
from ..models import EstoqueSangue
from ..schemas import EstoqueItem, HospitalAtualizar, HospitalDetalhe
from ..services.geo import geocodificar

router = APIRouter(prefix="/hospitais", tags=["Hospitais"])


@router.get("/me", response_model=HospitalDetalhe)
def meu_hospital(hospital: HospitalDoRepresentante):
    """Formulário com os dados atuais do hospital do representante logado."""
    return hospital


@router.put("/me", response_model=HospitalDetalhe)
def atualizar_meu_hospital(dados: HospitalAtualizar, hospital: HospitalDoRepresentante, db: DB):
    """Atualiza endereço, horários, exceções etc. Só os campos enviados mudam."""
    alteracoes = dados.model_dump(exclude_unset=True)
    for campo, valor in alteracoes.items():
        if campo in {"nome", "endereco"} and valor is None:
            raise HTTPException(422, f"{campo} não pode ser vazio.")
        setattr(hospital, campo, valor)

    endereco_mudou = "endereco" in alteracoes
    coords_enviadas = "latitude" in alteracoes or "longitude" in alteracoes
    if endereco_mudou and not coords_enviadas:
        coords = geocodificar(hospital.endereco)
        hospital.latitude, hospital.longitude = coords if coords else (None, None)

    db.commit()
    db.refresh(hospital)
    return hospital


@router.put("/me/estoque", response_model=HospitalDetalhe)
def atualizar_estoque(itens: list[EstoqueItem], hospital: HospitalDoRepresentante, db: DB):
    """Atualiza o banco de sangue. Tipos não enviados ficam como estão."""
    tipos = [i.tipo_sanguineo for i in itens]
    if len(tipos) != len(set(tipos)):
        raise HTTPException(422, "Tipo sanguíneo repetido na lista.")

    for item in itens:
        estoque = hospital.estoque_do_tipo(item.tipo_sanguineo)
        if estoque is None:
            hospital.estoque.append(
                EstoqueSangue(
                    tipo_sanguineo=item.tipo_sanguineo,
                    quantidade=item.quantidade,
                    quantidade_minima=item.quantidade_minima,
                )
            )
        else:
            estoque.quantidade = item.quantidade
            estoque.quantidade_minima = item.quantidade_minima
    db.commit()
    db.refresh(hospital)
    return hospital
