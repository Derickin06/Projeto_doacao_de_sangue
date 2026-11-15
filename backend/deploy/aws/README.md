# Publicar no AWS Academy (Learner Lab)

O site (frontend), a API e o MySQL rodam em containers Docker numa instância EC2.
O script [`instalar.sh`](instalar.sh) faz tudo: instala o Docker, baixa o código do
GitHub, gera senhas aleatórias, sobe os containers e cria dados de exemplo.

```
Navegador ──HTTP:80──▶ nginx (site React)  ──/api──▶  API FastAPI ──▶ MySQL
                       └──────────────── instância EC2 (Docker) ────────────────┘
```

> O script baixa o código do GitHub: faça o `git push` antes e confira a branch.

## 1. Inicie o lab

No AWS Academy, abra o **Learner Lab** → **Start Lab** → espere a bolinha ficar verde →
clique em **AWS** para abrir o console.

## 2. Crie a instância EC2

No console: **EC2 → Instances → Launch instances**.

| Campo | Valor |
|---|---|
| Name | `doacao-sangue` |
| AMI | **Ubuntu Server 24.04 LTS** |
| Instance type | **t3.small** (a `t3.micro` funciona, mas o primeiro build fica lento) |
| Key pair | `vockey` |
| Network settings → Edit | Mantenha **SSH (22)** e adicione uma regra **HTTP**, porta **80**, origem **Anywhere (0.0.0.0/0)** |
| Storage | 16 GiB |
| Advanced details → **User data** | Cole o conteúdo de `instalar.sh` (veja abaixo) |

No topo do script colado, confira:

```bash
REPO_URL="${REPO_URL:-https://github.com/Derickin06/Projeto_doacao_de_sangue.git}"
BRANCH="${BRANCH:-main}"   # a branch onde estão o backend e o frontend
```

> **Repositório privado?** Use uma URL com token no `REPO_URL`:
> `https://SEU_USUARIO:SEU_TOKEN@github.com/Derickin06/Projeto_doacao_de_sangue.git`
> (token criado em GitHub → Settings → Developer settings → Personal access tokens).

Clique em **Launch instance**.

## 3. Aguarde e acesse

A primeira instalação leva de **5 a 10 minutos** depois que a instância fica *Running*,
porque compila a API e o site. Pegue o **Public IPv4 address** nos detalhes da instância e
abra:

```
http://IP_PUBLICO
```

É `http://`, não `https://`. Login do hospital de exemplo: `hc@exemplo.com` / `senha123`.

Para acompanhar a instalação: selecione a instância → **Connect → EC2 Instance Connect →
Connect** e rode:

```bash
sudo tail -f /var/log/doacao-sangue-instalacao.log
```

A última linha deve ser `==> Pronto! Site: http://.../`.

## Sem User data (instância já existente)

Conectado por **EC2 Instance Connect**:

```bash
curl -fsSLO https://raw.githubusercontent.com/Derickin06/Projeto_doacao_de_sangue/main/backend/deploy/aws/instalar.sh
sudo BRANCH=main bash instalar.sh
```

(O `curl` acima só funciona com repositório público. Se for privado, crie o arquivo com
`nano instalar.sh`, cole o conteúdo e rode o mesmo `sudo ... bash instalar.sh` com o
`REPO_URL` contendo o token.)

Se a instância já tinha a versão antiga (só o backend, com a API na porta 80), basta rodar
o instalador de novo. Ele ajusta o `.env` sozinho: o site passa para a porta 80 e a API
para a 8000.

## Atualizar depois de novos commits

```bash
sudo bash /opt/doacao-sangue/backend/deploy/aws/atualizar.sh
```

## Particularidades do Learner Lab

- **A sessão do lab expira** (cerca de 4 h) e a instância é **desligada**, não apagada.
  No próximo *Start Lab* ela volta. Se não voltar sozinha, use *Instance state → Start*.
  Os containers sobem automaticamente e os dados do MySQL são mantidos.
- **O IP público muda** sempre que a instância liga. Confira antes de apresentar.
- **Swagger (documentação da API):** fica em `http://IP_PUBLICO:8000/docs`. Para acessar,
  adicione no security group uma regra **Custom TCP 8000**. O site não precisa dela.
- **Comandos úteis**, dentro de `/opt/doacao-sangue/backend` e com `sudo`:
  - `docker compose ps` mostra o status dos containers.
  - `docker compose logs -f api` (ou `web`) acompanha os logs.
  - `docker compose restart` reinicia tudo.
- **O MySQL não fica exposto na internet.** As senhas geradas ficam em
  `/opt/doacao-sangue/backend/.env`.

## Opcional — banco no Amazon RDS

1. **RDS → Create database**: *Standard create*, **MySQL**, template **Free tier** (ou
   *Dev/Test*), `db.t3.micro`, usuário e senha, **Initial database name** =
   `doacao_sangue`, *Public access*: **No**.
2. No **security group do RDS**, libere a porta **3306** para o security group da EC2.
3. Na EC2, acrescente ao `/opt/doacao-sangue/backend/.env`:
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
exigindo SSL. Crie o banco com MySQL 8.0, ou mude `require_secure_transport` para `0`
num *parameter group* próprio.
