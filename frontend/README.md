# Frontend — HemoConnect (React + Vite)

Site do Sistema de Doação de Sangue, feito a partir do protótipo do
[Figma Make](https://www.figma.com/make/pD13GNYTOk4aVPxW0MsAe0/Doa%C3%A7%C3%A3o-de-Sangue-App)
e ligado à API do [`backend/`](../backend/README.md).

| Tela | Caso de uso | Rota | API usada |
|---|---|---|---|
| Página inicial | — | `#/` | `GET /campanhas` (números de campanhas ativas) |
| Campanhas (lista com busca e filtros) | **UC03** | `#/campanhas` | `GET /campanhas` |
| Detalhes da campanha | **UC03** | `#/campanhas/{id}` | `GET /campanhas/{id}` |
| Acesso do hospital (login) | — | `#/login` | `POST /auth/login` |
| Painel de gestão do hospital | **UC02** | `#/painel` | `GET/PUT /hospitais/me`, `PUT /hospitais/me/estoque` |
| Nova campanha | **UC04** | `#/painel/nova-campanha` | `GET /campanhas/modelo`, `POST /campanhas` |

Login de exemplo (depois de rodar o seed do backend): `hc@exemplo.com` / `senha123`.

## Rodar no computador

Precisa do **Node.js 22** (ou 20.19+) e do backend rodando na porta 8000
(veja o [README do backend](../backend/README.md#rodar-no-computador)).

Em um terminal, suba o backend; em **outro terminal**:

```bash
cd frontend
npm install          # só na primeira vez
npm run dev
```

Abra **http://localhost:5173**. O Vite repassa tudo que começa com `/api` para o
backend em `http://localhost:8000`. Se o backend estiver em outro endereço:
`BACKEND_URL=http://outro-endereco:8000 npm run dev`.

Outros comandos:

```bash
npm run typecheck    # checa os tipos (TypeScript)
npm run build        # gera a versão final em dist/
```

## Rodar tudo com Docker (MySQL + API + site)

```bash
cd backend
docker compose up -d --build
docker compose exec api python -m scripts.seed     # dados de exemplo (opcional)
```

Site: **http://localhost:3000** · API/Swagger: http://localhost:8000/docs

No container, o site é servido pelo **nginx** ([`nginx.conf`](nginx.conf)), que também
repassa `/api/...` para a API. Por isso o navegador só conversa com um endereço e não
há problema de CORS.

## Publicar na AWS

O instalador do backend já sobe o site junto, na porta 80. Passo a passo em
[`backend/deploy/aws/README.md`](../backend/deploy/aws/README.md).

## Diferenças em relação ao protótipo do Figma

O protótipo era uma demonstração com dados fixos. Na implementação, cada tela usa os
dados reais da API, e as telas sem caso de uso no escopo ficaram de fora:

- **Hemocentros próximos** e **Agendamento** (`HospitalsPage`, `AppointmentPage`) não
  foram implementadas: dependem do UC01 e de um agendamento que não fazem parte do
  backend. No lugar delas entraram as telas de **Campanhas** (UC03), no mesmo estilo
  dos cards de hospitais.
- **Painel do hospital** (UC02):
  - O horário virou um campo de texto livre ("Seg a Sex 07h–17h; Sáb 07h–12h"),
    porque o backend guarda o horário como texto.
  - O calendário de "Dias sem atendimento" virou um campo de avisos e exceções
    (`observacoes` no backend).
  - A demanda por tipo sanguíneo não é mais escolhida à mão. Ela é **calculada** a
    partir das bolsas em estoque e do estoque mínimo, com as mesmas cores e rótulos
    do protótipo:
    - **Alta necessidade:** menos da metade do mínimo.
    - **Moderada:** abaixo do mínimo.
    - **Normal:** entre o mínimo e o dobro dele.
    - **Baixa:** o dobro do mínimo ou mais.
- **Nova campanha** (UC04) é uma tela nova no padrão visual do protótipo, com
  formulário pré-preenchido e prévia do card que os doadores vão ver.
- **Página inicial:** os números (campanhas ativas e hemocentros) vêm da API, no lugar
  dos valores fixos do protótipo.
- **Tailwind:** o protótipo importava o Tailwind, mas todo o visual era feito com
  estilos próprios. Ele foi removido, e um reset equivalente está em `src/index.css`.
- O layout foi adaptado para celular.

## Estrutura

```
frontend/
├── index.html
├── src/
│   ├── main.tsx / App.tsx      # entrada e rotas (#/...)
│   ├── api.ts                  # chamadas à API e token de login
│   ├── auth.ts, router.ts      # login e navegação
│   ├── types.ts                # formatos de dados da API
│   ├── compatibilidade.ts      # regra ABO/Rh (igual à do backend)
│   ├── estoque.ts              # status de demanda por tipo sanguíneo
│   ├── format.ts               # datas
│   ├── index.css               # cores, fontes e componentes do protótipo
│   ├── components/             # Nav, cards, estados de carregando/erro
│   └── pages/                  # uma tela por arquivo
├── Dockerfile, nginx.conf      # build e servidor para Docker/AWS
└── vite.config.ts              # proxy /api → backend em desenvolvimento
```
