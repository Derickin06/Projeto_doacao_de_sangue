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
