# Backend — API REST (FastAPI + MySQL)

Implementação do "Servidor de Aplicação" do diagrama de implantação: uma API REST em
Python que o app (web/mobile) consome via HTTPS, com MySQL como banco de dados e o
Google Maps para converter endereços em coordenadas.

**Escopo:** UC02 (atualizar informações do hospital), UC03 (visualizar campanhas) e
UC04 (criar campanha). UC01 (visualizar e selecionar hospital) e UC05 (doação direta)
ficaram fora desta entrega.

## Como rodar

### Opção 1 — Docker (MySQL + API juntos)

```bash
cd backend
docker compose up --build
# em outro terminal, dados de exemplo:
docker compose exec api python -m scripts.seed
```

### Opção 2 — Python local

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # ajuste DATABASE_URL para o seu MySQL
python -m scripts.seed             # opcional: dados de exemplo
uvicorn app.main:app --reload
```

Sem `DATABASE_URL`, a API usa um arquivo SQLite local — bom para testar sem instalar MySQL.

Documentação interativa (Swagger): **http://localhost:8000/docs** — dá para testar
todas as rotas por lá, inclusive com login (botão *Authorize*).

### Testes

```bash
cd backend
pytest
```

Os testes usam SQLite em memória, então não precisam de MySQL.

## Estrutura

```
backend/
├── app/
│   ├── main.py              # cria a aplicação e registra as rotas
│   ├── config.py            # variáveis de ambiente
│   ├── database.py          # conexão SQLAlchemy
│   ├── models.py            # tabelas (diagrama de classes)
│   ├── schemas.py           # validação de entrada/saída
│   ├── security.py          # hash de senha + JWT
│   ├── deps.py              # representante logado e o hospital dele
│   ├── routers/             # uma rota por grupo de casos de uso
│   └── services/
│       ├── compatibilidade.py   # tipos sanguíneos e regra ABO/Rh (port do TipoSangue.java)
│       └── geo.py               # Google Maps (endereço → coordenadas)
├── scripts/seed.py          # dados de exemplo
└── tests/                   # pytest
```

## Rotas por caso de uso

| Caso de uso | Rota | Quem |
|---|---|---|
| Cadastro / login do representante | `POST /auth/representantes` (cria o representante e o hospital), `POST /auth/login`, `GET /auth/me` | representante |
| **UC02** Atualizar informações do hospital | `GET /hospitais/me`, `PUT /hospitais/me`, `PUT /hospitais/me/estoque` | representante |
| **UC03** Visualizar campanhas | `GET /campanhas?ativas=&hospital_id=`, `GET /campanhas/{id}` | público (doador não precisa de conta) |
| **UC04** Criar campanha | `GET /campanhas/modelo` (formulário pré-preenchido com os dados do hospital — o «include» do UC02), `POST /campanhas` | representante |

As rotas protegidas usam o cabeçalho `Authorization: Bearer <token>` devolvido pelo login.

## Regras de negócio

**Tipos sanguíneos** (`services/compatibilidade.py`): valida e padroniza os tipos usados
no estoque e nas campanhas (`"+a"`, `"a+"` e `"A+"` viram `A+`). O arquivo também traz a
regra de compatibilidade ABO/Rh, port da classe `TipoSangue` (main.java), corrigindo dois
problemas da versão Java: ela olhava só o segundo caractere (então `+AB` era tratado como
A) e não deixava A, B e O+ doarem para os tipos que deveriam. Os testes de `mainTest.java`
foram portados em `tests/test_compatibilidade.py`.

**Necessidade de sangue**: cada tipo no estoque tem uma quantidade atual e uma mínima.
O que falta para chegar ao mínimo é a necessidade; os tipos em falta aparecem no hospital
(UC02) e são sugeridos automaticamente ao criar uma campanha (UC04).

**Campanhas**: a data final não pode ser anterior à inicial nem estar no passado. Se o
representante não informar endereço ou tipos necessários, a campanha usa os do hospital.

## Diferenças em relação ao diagrama de classes

- `BancoDeSangue` virou a tabela `banco_de_sangue`, com **uma linha por tipo sanguíneo**
  de cada hospital, mais `quantidade_minima` (usada para calcular a necessidade).
- `Hospital` ganhou `telefone`, `horario_funcionamento`, `observacoes` (exceções) e
  `latitude`/`longitude` (dados que o UC02 atualiza).
- `Campanha` guarda o `hospital_id`, a lista de tipos necessários e as coordenadas.
- O Representante tem senha (guardada com hash PBKDF2) para o login.
- `Doador` não virou tabela: no escopo atual ele só visualiza campanhas, o que é público.
  Entra no banco quando UC01/UC05 (ou a participação em campanhas) forem implementados.

## Próximos passos sugeridos

- Frontend a partir das telas do Figma consumindo esta API.
- Migrações com Alembic quando o schema começar a mudar.
- UC01 (visualizar e selecionar hospital) e UC05 (doação direta), se entrarem no escopo.
