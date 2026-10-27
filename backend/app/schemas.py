"""Formatos de entrada e saída da API (validação com Pydantic)."""

import re
from datetime import date
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, model_validator

from .services.compatibilidade import normalizar_tipo

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validar_email(valor: str) -> str:
    valor = valor.strip().lower()
    if not _EMAIL_RE.match(valor):
        raise ValueError("E-mail inválido.")
    return valor


Email = Annotated[str, Field(max_length=255), AfterValidator(_validar_email)]
TipoSanguineo = Annotated[str, AfterValidator(normalizar_tipo)]
Senha = Annotated[str, Field(min_length=6, max_length=128)]


class _ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------- autenticação
class LoginEntrada(BaseModel):
    email: Email
    senha: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ------------------------------------------------------------------- hospital
class HospitalBase(BaseModel):
    nome: str = Field(min_length=2, max_length=150)
    endereco: str = Field(min_length=5, max_length=255)
    telefone: str | None = Field(default=None, max_length=30)
    horario_funcionamento: str | None = Field(default=None, max_length=255)
    observacoes: str | None = None


class HospitalCriar(HospitalBase):
    pass


class HospitalAtualizar(BaseModel):
    """UC02 — todos os campos são opcionais; só o que for enviado é alterado."""

    nome: str | None = Field(default=None, min_length=2, max_length=150)
    endereco: str | None = Field(default=None, min_length=5, max_length=255)
    telefone: str | None = Field(default=None, max_length=30)
    horario_funcionamento: str | None = Field(default=None, max_length=255)
    observacoes: str | None = None


class EstoqueItem(BaseModel):
    tipo_sanguineo: TipoSanguineo
    quantidade: int = Field(ge=0)
    quantidade_minima: int = Field(ge=0)


class EstoqueOut(_ORM):
    tipo_sanguineo: str
    quantidade: int
    quantidade_minima: int
    necessidade: int


class HospitalDetalhe(_ORM):
    id: int
    nome: str
    endereco: str
    telefone: str | None
    horario_funcionamento: str | None
    observacoes: str | None
    tipos_em_falta: list[str]
    estoque: list[EstoqueOut]


# -------------------------------------------------------------- representante
class RepresentanteCriar(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    email: Email
    senha: Senha
    hospital: HospitalCriar


class RepresentanteOut(_ORM):
    id: int
    nome: str
    email: str
    hospital: HospitalDetalhe | None


# ------------------------------------------------------------------- campanha
class CampanhaCriar(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    descricao: str | None = None
    data_inicio: date
    data_fim: date
    # Se omitidos, usa os dados do hospital do representante (UC04 inclui UC02)
    endereco: str | None = Field(default=None, min_length=5, max_length=255)
    tipos_necessarios: list[TipoSanguineo] = Field(default_factory=list)

    @model_validator(mode="after")
    def _datas_validas(self):
        if self.data_fim < self.data_inicio:
            raise ValueError("data_fim não pode ser anterior a data_inicio.")
        # remove duplicados mantendo a ordem
        self.tipos_necessarios = list(dict.fromkeys(self.tipos_necessarios))
        return self


class CampanhaModelo(BaseModel):
    """Formulário pré-preenchido com os dados do hospital (UC04)."""

    hospital_id: int
    hospital_nome: str
    endereco: str
    tipos_necessarios: list[str]


class CampanhaOut(BaseModel):
    id: int
    nome: str
    descricao: str | None
    data_inicio: date
    data_fim: date
    endereco: str
    tipos_necessarios: list[str]
    hospital_id: int
    hospital_nome: str
    ativa: bool
