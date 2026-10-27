# Backend — API REST (FastAPI + MySQL)

Implementação do "Servidor de Aplicação" do diagrama de implantação: uma API REST em
Python que o app (web/mobile) consome via HTTP(S), com MySQL como banco de dados,
hospedada numa instância EC2 do **AWS Academy (Learner Lab)**.

**Escopo:** UC02 (atualizar informações do hospital), UC03 (visualizar campanhas) e
UC04 (criar campanha). UC01 (visualizar e selecionar hospital) e UC05 (doação direta)
ficaram fora desta entrega.

- [Rodar no computador](#rodar-no-computador)
- [Publicar no AWS Academy](#publicar-no-aws-academy-learner-lab)
- [Rotas](#rotas-por-caso-de-uso) · [Regras de negócio](#regras-de-negócio) · [Estrutura](#estrutura)

---

## Rodar no computador

### Opção 1 — Python (mais rápido, usa SQLite, não precisa de MySQL)

```bash
cd backend
python -m venv .venv
# ative o ambiente:
#   Windows PowerShell:  .venv\Scripts\Activate.ps1
#   Windows Git Bash:    source .venv/Scripts/activate
#   Mac/Linux:           source .venv/bin/activate
pip install -r requirements.txt
pytest                             # testes automáticos
python -m scripts.seed             # dados de exemplo (opcional)
uvicorn app.main:app --reload
```

Rode tudo **de dentro da pasta `backend`** (não de dentro da `.venv`), com `(.venv)`
aparecendo no começo da linha do terminal.

### Opção 2 — Docker (MySQL + API, igual à AWS)

```bash
cd backend
docker compose up -d --build
docker compose exec api python -m scripts.seed     # dados de exemplo (opcional)
```

Nos dois casos, abra **http://localhost:8000/docs** (Swagger) para testar as rotas.
Login de exemplo: `hc@exemplo.com` / `senha123` → copie o `access_token` e cole no botão
**Authorize**.

---

## Publicar no AWS Academy (Learner Lab)

A API e o MySQL rodam em containers Docker numa instância EC2. O script
[`deploy/aws/instalar.sh`](deploy/aws/instalar.sh) faz a instalação inteira: Docker,
código, senhas aleatórias, containers e dados de exemplo.

### 1. Inicie o lab

No AWS Academy, abra o **Learner Lab** → **Start Lab** → espere a bolinha ficar verde →
clique em **AWS** para abrir o console.

### 2. Crie a instância EC2

No console: **EC2 → Instances → Launch instances**.

| Campo | Valor |
|---|---|
| Name | `doacao-sangue-api` |
| AMI | **Ubuntu Server 24.04 LTS** |
| Instance type | **t3.small** (a `t2.micro`/`t3.micro` funciona, mas fica lenta) |
| Key pair | `vockey` |
| Network settings → Edit | Mantenha **SSH (22)** e clique em **Add security group rule**: tipo **HTTP**, porta **80**, origem **Anywhere (0.0.0.0/0)** |
| Storage | 16 GiB |
| Advanced details → **User data** | Cole o conteúdo de `deploy/aws/instalar.sh` (veja abaixo) |

No topo do script colado, ajuste:

```bash
REPO_URL="${REPO_URL:-https://github.com/Derickin06/Projeto_doacao_de_sangue.git}"
BRANCH="${BRANCH:-main}"   # a branch onde está o backend (ex.: backend-fastapi)
```

> **Repositório privado?** Use uma URL com token no `REPO_URL`:
> `https://SEU_USUARIO:SEU_TOKEN@github.com/Derickin06/Projeto_doacao_de_sangue.git`
> (token criado em GitHub → Settings → Developer settings → Personal access tokens).

Clique em **Launch instance**.

### 3. Aguarde e acesse

A instalação leva de 3 a 6 minutos depois que a instância fica *Running*. Pegue o
**Public IPv4 address** nos detalhes da instância e abra:

```
http://IP_PUBLICO/docs
```

É `http://`, não `https://`, e sem porta.

Para acompanhar a instalação: selecione a instância → **Connect → EC2 Instance Connect →
Connect** e rode:

```bash
sudo tail -f /var/log/doacao-sangue-instalacao.log
```

A última linha deve ser `==> Pronto! Documentação da API: http://.../docs`.

### Sem User data (instalação manual)

Se a instância já existe, conecte-se por **EC2 Instance Connect** e rode:

```bash
curl -fsSLO https://raw.githubusercontent.com/Derickin06/Projeto_doacao_de_sangue/main/backend/deploy/aws/instalar.sh
sudo BRANCH=main bash instalar.sh
```

O link do `curl` só funciona com repositório público. Com repositório privado, copie o
conteúdo de `instalar.sh` para um arquivo na instância (por exemplo com `nano instalar.sh`)
e rode o mesmo `sudo ... bash instalar.sh`, com `REPO_URL` contendo o token.

### Atualizar depois de novos commits

```bash
sudo bash /opt/doacao-sangue/backend/deploy/aws/atualizar.sh
```

### Particularidades do Learner Lab

- **A sessão do lab expira** (cerca de 4 h) e a instância é **desligada**, não apagada. No
  próximo *Start Lab* ela volta a ligar. Se não voltar, use *Instance state → Start*.
  Os containers sobem sozinhos (`restart: unless-stopped`) e os dados do MySQL são mantidos.
- **O IP público muda** sempre que a instância liga. Confira o IP novo antes de apresentar
  ou de configurar o frontend.
- **Use o endereço da API no frontend**, por exemplo `http://IP_PUBLICO`. O CORS já está
  liberado para qualquer origem (`CORS_ORIGINS=*` no `.env`).
- **Comandos úteis** (dentro de `/opt/doacao-sangue/backend`, com `sudo`):
  `docker compose ps` (status), `docker compose logs -f api` (logs),
  `docker compose restart api` (reiniciar).
- **O MySQL não fica exposto na internet.** Ele só aceita conexões de dentro da instância.
  As senhas geradas ficam em `/opt/doacao-sangue/backend/.env`.

### Opcional — banco no Amazon RDS

Para separar o banco da aplicação, como no diagrama de implantação:

1. **RDS → Create database**: *Standard create*, **MySQL**, template **Free tier** (ou
   *Dev/Test*), instância `db.t3.micro`, defina usuário e senha, em *Additional
   configuration* coloque **Initial database name** = `doacao_sangue`. *Public access*: **No**.
2. No **security group do RDS**, libere a porta **3306** para o security group da EC2.
3. Na EC2, edite `/opt/doacao-sangue/backend/.env` e acrescente:
   ```
   DATABASE_URL=mysql+pymysql://USUARIO:SENHA@ENDPOINT_DO_RDS:3306/doacao_sangue
   ```
4. Troque os containers:
   ```bash
   cd /opt/doacao-sangue/backend
   sudo docker compose down
   sudo docker compose -f docker-compose.rds.yml up -d --build
   sudo docker compose -f docker-compose.rds.yml exec api python -m scripts.seed
   ```

Se aparecer o erro *"Connections using insecure transport are prohibited"*, o RDS está
exigindo SSL: crie o banco com MySQL 8.0, ou mude `require_secure_transport` para `0` num
*parameter group* próprio.

---

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
O que falta para chegar ao mínimo é a necessidade. Os tipos em falta aparecem no hospital
(UC02) e são sugeridos automaticamente ao criar uma campanha (UC04).

**Campanhas**: a data final não pode ser anterior à inicial nem estar no passado. Se o
representante não informar endereço ou tipos necessários, a campanha usa os do hospital.

## Diferenças em relação ao diagrama de classes

- `BancoDeSangue` virou a tabela `banco_de_sangue`, com **uma linha por tipo sanguíneo**
  de cada hospital, mais `quantidade_minima` (usada para calcular a necessidade).
- `Hospital` ganhou `telefone`, `horario_funcionamento` e `observacoes` (exceções),
  que são os dados que o UC02 atualiza.
- `Campanha` guarda o `hospital_id` e a lista de tipos sanguíneos necessários.
- O Representante tem senha (guardada com hash PBKDF2) para o login.
- `Doador` não virou tabela: no escopo atual ele só visualiza campanhas, o que é público.
  Ele entra no banco quando UC01/UC05 (ou a participação em campanhas) forem implementados.

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
│   ├── routers/             # auth, hospitais (UC02), campanhas (UC03/UC04)
│   └── services/
│       └── compatibilidade.py   # tipos sanguíneos e regra ABO/Rh (port do TipoSangue.java)
├── deploy/aws/
│   ├── instalar.sh          # instala e sobe tudo numa EC2 Ubuntu
│   └── atualizar.sh         # puxa o código novo do GitHub e reinicia
├── docker-compose.yml       # MySQL + API (computador e EC2)
├── docker-compose.rds.yml   # só a API, usando o Amazon RDS
├── Dockerfile
├── scripts/seed.py          # dados de exemplo
└── tests/                   # pytest (SQLite em memória, não precisa de MySQL)
```

## Próximos passos sugeridos

- Frontend a partir das telas do Figma consumindo esta API.
- HTTPS na frente da API (ex.: Nginx + certificado), se for exigido.
- Migrações com Alembic quando o schema começar a mudar.
- UC01 (visualizar e selecionar hospital) e UC05 (doação direta), se entrarem no escopo.
