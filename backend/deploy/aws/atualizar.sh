#!/usr/bin/env bash
# Atualiza o backend na EC2 com a versão mais recente do GitHub e reinicia a API.
# Uso (conectado na instância):  sudo bash /opt/doacao-sangue/backend/deploy/aws/atualizar.sh
set -euo pipefail

DESTINO=/opt/doacao-sangue
BRANCH="${BRANCH:-$(git -C "$DESTINO" rev-parse --abbrev-ref HEAD)}"

git -C "$DESTINO" fetch --depth 1 origin "$BRANCH"
git -C "$DESTINO" checkout -B "$BRANCH" FETCH_HEAD

cd "$DESTINO/backend"
docker compose up -d --build
docker compose ps
echo "==> Atualizado para: $(git -C "$DESTINO" log -1 --format='%h %s')"
