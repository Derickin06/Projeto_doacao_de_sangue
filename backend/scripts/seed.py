"""Popula o banco com dados de exemplo para testar o app.

Uso (dentro da pasta backend):  python -m scripts.seed
Logins criados (senha "senha123"):
  representantes: hc@exemplo.com, santacasa@exemplo.com, guarulhos@exemplo.com
"""

from datetime import date, timedelta

from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import Campanha, EstoqueSangue, Hospital, Representante
from app.security import hash_senha

SENHA = hash_senha("senha123")

HOSPITAIS = [
    {
        "email": "hc@exemplo.com",
        "rep": "Mariana Souza",
        "nome": "Hemocentro Hospital das Clínicas",
        "endereco": "Av. Dr. Enéas Carvalho de Aguiar, 155 - Cerqueira César, São Paulo - SP",
        "horario": "Seg a Sex 7h–18h; Sáb 7h–17h",
        "estoque": {"O-": (3, 20), "O+": (25, 30), "A-": (6, 10), "A+": (30, 25),
                    "B-": (2, 6), "B+": (12, 10), "AB-": (1, 3), "AB+": (8, 5)},
    },
    {
        "email": "santacasa@exemplo.com",
        "rep": "Carlos Lima",
        "nome": "Banco de Sangue Santa Casa",
        "endereco": "R. Dr. Cesário Mota Júnior, 112 - Vila Buarque, São Paulo - SP",
        "horario": "Seg a Sáb 8h–16h",
        "estoque": {"O-": (18, 12), "O+": (10, 25), "A-": (9, 8), "A+": (40, 20),
                    "B+": (6, 10), "AB+": (4, 4)},
    },
    {
        "email": "guarulhos@exemplo.com",
        "rep": "Fernanda Alves",
        "nome": "Hemonúcleo de Guarulhos",
        "endereco": "Av. Tiradentes, 1200 - Centro, Guarulhos - SP",
        "horario": "Seg a Sex 8h–17h",
        "estoque": {"O-": (8, 8), "O+": (30, 15), "A+": (5, 15), "B+": (9, 6)},
    },
]


def main() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.scalar(select(Representante.id).limit(1)) is not None:
            print("Banco já tem dados; nada a fazer.")
            return

        hospitais = []
        for h in HOSPITAIS:
            hospital = Hospital(
                nome=h["nome"], endereco=h["endereco"],
                horario_funcionamento=h["horario"], telefone="(11) 0000-0000",
            )
            hospital.estoque = [
                EstoqueSangue(tipo_sanguineo=t, quantidade=q, quantidade_minima=m)
                for t, (q, m) in h["estoque"].items()
            ]
            rep = Representante(nome=h["rep"], email=h["email"], senha_hash=SENHA)
            rep.hospital = hospital
            db.add(rep)
            hospitais.append((rep, hospital))

        hoje = date.today()
        rep, hospital = hospitais[0]
        db.add(Campanha(
            nome="Doe sangue, salve vidas — Campanha de Primavera",
            descricao="Mutirão de coleta com foco em O- e B-.",
            data_inicio=hoje, data_fim=hoje + timedelta(days=14),
            endereco=hospital.endereco,
            tipos_necessarios="O-,B-", hospital=hospital, representante=rep,
        ))
        rep, hospital = hospitais[2]
        db.add(Campanha(
            nome="Coleta no Shopping Internacional",
            data_inicio=hoje + timedelta(days=7), data_fim=hoje + timedelta(days=9),
            endereco="Rod. Pres. Dutra, km 225 - Guarulhos - SP",
            tipos_necessarios="A+", hospital=hospital, representante=rep,
        ))
        db.commit()
        print("Dados de exemplo criados. Senha de todos os usuários: senha123")


if __name__ == "__main__":
    main()
