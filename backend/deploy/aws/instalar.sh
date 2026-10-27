#!/usr/bin/env bash
# Instala e sobe o backend numa instância EC2 Ubuntu (AWS Academy / Learner Lab).
#
# Dois jeitos de usar:
#
#   1) Como "User data" ao criar a instância (roda sozinho no primeiro boot):
#      cole este arquivo inteiro no campo Advanced details → User data,
#      depois de ajustar REPO_URL e BRANCH logo abaixo.
#
#   2) Manualmente, conectado na instância (EC2 Instance Connect):
#      sudo REPO_URL=https://github.com/USUARIO/REPO.git BRANCH=main bash instalar.sh
#
# Pode rodar de novo sem problema: só atualiza o código e reinicia os containers.
# Log da execução: /var/log/doacao-sangue-instalacao.log
set -euo pipefail

# ----------------------------------------------------------------- ajuste aqui
REPO_URL="${REPO_URL:-https://github.com/Derickin06/Projeto_doacao_de_sangue.git}"
BRANCH="${BRANCH:-main}"
API_PORT="${API_PORT:-80}"          # 80 = acessa sem ":8000" no endereço
CARREGAR_EXEMPLOS="${CARREGAR_EXEMPLOS:-1}"   # 1 = cria hospitais/campanhas de exemplo
# -----------------------------------------------------------------------------

DESTINO=/opt/doacao-sangue
BACKEND="$DESTINO/backend"
LOG=/var/log/doacao-sangue-instalacao.log

if [ "$(id -u)" -ne 0 ]; then
  echo "Rode como root: sudo bash $0" >&2
  exit 1
fi
exec > >(tee -a "$LOG") 2>&1

echo "==> $(date) — instalando backend de $REPO_URL (branch $BRANCH)"

# 1. Pacotes: Docker, Docker Compose e Git
export DEBIAN_FRONTEND=noninteractive
if ! command -v docker >/dev/null || ! docker compose version >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y docker.io docker-compose-v2 git curl openssl
fi
systemctl enable --now docker
# deixa o usuário padrão da EC2 usar docker sem sudo
id ubuntu >/dev/null 2>&1 && usermod -aG docker ubuntu || true

# 2. Memória extra (swap): o MySQL fica instável em instâncias com 1 GB de RAM
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
swapon /swapfile 2>/dev/null || true   # já ativo = sem problema

# 3. Código
if [ -d "$DESTINO/.git" ]; then
  git -C "$DESTINO" fetch --depth 1 origin "$BRANCH"
  git -C "$DESTINO" checkout -B "$BRANCH" FETCH_HEAD
else
  if ! git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$DESTINO"; then
    echo "!! Não consegui clonar $REPO_URL (branch $BRANCH)."
    echo "!! Se o repositório for privado, use uma URL com token:"
    echo "!!   https://SEU_USUARIO:SEU_TOKEN@github.com/USUARIO/REPO.git"
    echo "!! ou copie o projeto para $DESTINO e rode este script de novo."
    exit 1
  fi
fi

# 4. Configuração (.env) — gerada uma única vez, com senhas aleatórias
if [ ! -f "$BACKEND/.env" ]; then
  cat > "$BACKEND/.env" <<EOF
DB_PASSWORD=$(openssl rand -hex 16)
DB_ROOT_PASSWORD=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRA_MINUTOS=720
API_PORT=$API_PORT
CORS_ORIGINS=*
EOF
  chmod 600 "$BACKEND/.env"
  echo "==> .env criado em $BACKEND/.env"
fi

# 5. Sobe MySQL + API
cd "$BACKEND"
docker compose up -d --build

# 6. Espera a API responder
PORTA=$(grep -E '^API_PORT=' .env | cut -d= -f2 || true)
PORTA=${PORTA:-$API_PORT}
echo "==> aguardando a API na porta $PORTA..."
for _ in $(seq 1 60); do
  if curl -fsS "http://localhost:$PORTA/" >/dev/null 2>&1; then
    break
  fi
  sleep 5
done

# 7. Dados de exemplo (só se o banco estiver vazio — o próprio script verifica)
if [ "$CARREGAR_EXEMPLOS" = "1" ]; then
  docker compose exec -T api python -m scripts.seed || true
fi

IP=$(curl -fsS -m 3 https://checkip.amazonaws.com 2>/dev/null || echo "IP_PUBLICO")
echo "==> Pronto! Documentação da API: http://$IP$( [ "$PORTA" = 80 ] || echo ":$PORTA" )/docs"
