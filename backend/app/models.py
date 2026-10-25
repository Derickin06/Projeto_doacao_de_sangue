"""Modelos do banco

Doador, Representante, Hospital, Campanha e BancoDeSangue (aqui ``EstoqueSangue``,
uma linha por tipo sanguíneo de cada hospital), mais duas tabelas que os casos de
uso exigem: ``participacoes`` (Doador participa de Campanha) e ``doacoes_diretas``
"""

from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def agora_utc() -> datetime:
    # Sem tzinfo: o DATETIME do MySQL não guarda fuso; convenção do projeto é UTC.
    return datetime.now(timezone.utc).replace(tzinfo=None)


participacoes = Table(
    "participacoes",
    Base.metadata,
    Column("doador_id", ForeignKey("doadores.id", ondelete="CASCADE"), primary_key=True),
    Column("campanha_id", ForeignKey("campanhas.id", ondelete="CASCADE"), primary_key=True),
)


class Doador(Base):
    __tablename__ = "doadores"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String(255))
    tipo_sanguineo: Mapped[str | None] = mapped_column(String(3), default=None)

    campanhas: Mapped[list["Campanha"]] = relationship(
        secondary=participacoes, back_populates="participantes"
    )


class Representante(Base):
    __tablename__ = "representantes"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String(255))

    hospital: Mapped[Optional["Hospital"]] = relationship(back_populates="representante")
    campanhas: Mapped[list["Campanha"]] = relationship(back_populates="representante")


class Hospital(Base):
    __tablename__ = "hospitais"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(150))
    endereco: Mapped[str] = mapped_column(String(255))
    telefone: Mapped[str | None] = mapped_column(String(30), default=None)
    horario_funcionamento: Mapped[str | None] = mapped_column(String(255), default=None)
    # Exceções de funcionamento, avisos (ex.: "fechado no feriado de 15/11")
    observacoes: Mapped[str | None] = mapped_column(Text, default=None)
    latitude: Mapped[float | None] = mapped_column(Float, default=None)
    longitude: Mapped[float | None] = mapped_column(Float, default=None)
    representante_id: Mapped[int | None] = mapped_column(
        ForeignKey("representantes.id"), unique=True, default=None
    )

    representante: Mapped[Representante | None] = relationship(back_populates="hospital")
    estoque: Mapped[list["EstoqueSangue"]] = relationship(
        back_populates="hospital",
        cascade="all, delete-orphan",
        order_by="EstoqueSangue.tipo_sanguineo",
    )
    campanhas: Mapped[list["Campanha"]] = relationship(back_populates="hospital")

    def estoque_do_tipo(self, tipo: str) -> "EstoqueSangue | None":
        return next((e for e in self.estoque if e.tipo_sanguineo == tipo), None)

    @property
    def tipos_em_falta(self) -> list[str]:
        em_falta = sorted(
            (e for e in self.estoque if e.necessidade > 0),
            key=lambda e: e.necessidade,
            reverse=True,
        )
        return [e.tipo_sanguineo for e in em_falta]


class EstoqueSangue(Base):
    """Banco de sangue do hospital: quantidade de bolsas por tipo sanguíneo."""

    __tablename__ = "banco_de_sangue"
    __table_args__ = (UniqueConstraint("hospital_id", "tipo_sanguineo"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitais.id", ondelete="CASCADE"))
    tipo_sanguineo: Mapped[str] = mapped_column(String(3))
    quantidade: Mapped[int] = mapped_column(Integer, default=0)  # bolsas disponíveis
    quantidade_minima: Mapped[int] = mapped_column(Integer, default=0)  # estoque ideal

    hospital: Mapped[Hospital] = relationship(back_populates="estoque")

    @property
    def necessidade(self) -> int:
        """Quantas bolsas faltam para atingir o estoque mínimo."""
        return max(0, self.quantidade_minima - self.quantidade)

    @property
    def excedente(self) -> int:
        """Quantas bolsas podem ser cedidas sem ficar abaixo do mínimo."""
        return max(0, self.quantidade - self.quantidade_minima)


class Campanha(Base):
    __tablename__ = "campanhas"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(150))
    descricao: Mapped[str | None] = mapped_column(Text, default=None)
    data_inicio: Mapped[date] = mapped_column(Date)
    data_fim: Mapped[date] = mapped_column(Date)
    endereco: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float | None] = mapped_column(Float, default=None)
    longitude: Mapped[float | None] = mapped_column(Float, default=None)
    # Lista separada por vírgula, ex.: "O-,A-"
    tipos_necessarios: Mapped[str] = mapped_column(String(40), default="")
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitais.id"))
    representante_id: Mapped[int] = mapped_column(ForeignKey("representantes.id"))
    criada_em: Mapped[datetime] = mapped_column(DateTime, default=agora_utc)

    hospital: Mapped[Hospital] = relationship(back_populates="campanhas")
    representante: Mapped[Representante] = relationship(back_populates="campanhas")
    participantes: Mapped[list[Doador]] = relationship(
        secondary=participacoes, back_populates="campanhas"
    )

    @property
    def lista_tipos_necessarios(self) -> list[str]:
        return [t for t in self.tipos_necessarios.split(",") if t]


class StatusDoacao:
    PENDENTE = "pendente"
    ACEITA = "aceita"
    RECUSADA = "recusada"


class DoacaoDireta(Base):
    """UC05: o hospital solicitante pede bolsas ao hospital doador."""

    __tablename__ = "doacoes_diretas"

    id: Mapped[int] = mapped_column(primary_key=True)
    hospital_solicitante_id: Mapped[int] = mapped_column(ForeignKey("hospitais.id"))
    hospital_doador_id: Mapped[int] = mapped_column(ForeignKey("hospitais.id"))
    tipo_sanguineo: Mapped[str] = mapped_column(String(3))
    quantidade: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default=StatusDoacao.PENDENTE)
    motivo_recusa: Mapped[str | None] = mapped_column(String(255), default=None)
    criada_em: Mapped[datetime] = mapped_column(DateTime, default=agora_utc)
    respondida_em: Mapped[datetime | None] = mapped_column(DateTime, default=None)

    hospital_solicitante: Mapped[Hospital] = relationship(foreign_keys=[hospital_solicitante_id])
    hospital_doador: Mapped[Hospital] = relationship(foreign_keys=[hospital_doador_id])
