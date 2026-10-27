# Projeto-Doação-de-Sangue-

# links auxiliares

Link Google Docs: https://docs.google.com/document/d/1fZguRS95zDG2ZQ4rsJeOO61aht4fMMbfmpGLaomVKtQ/edit?usp=sharing

Link Google Sheets: https://docs.google.com/spreadsheets/d/1bja-UOTeAVHtsSLmCIZyrKeJUPVNS2Ls6BIC09AyRK8/edit?usp=sharing

Link Figma: https://www.figma.com/make/pD13GNYTOk4aVPxW0MsAe0/Doa%C3%A7%C3%A3o-de-Sangue-App?t=81aICpOhMsjMJMW5-20&fullscreen=1

## Implementação

- [`backend/`](backend/README.md) — API REST em Python (FastAPI) + MySQL, cobrindo os casos de uso UC02 (atualizar informações do hospital), UC03 (visualizar campanhas) e UC04 (criar campanha).
  - **No computador:** `cd backend && docker compose up -d --build` e abra http://localhost:8000/docs
    (ou rode com Python + SQLite, sem Docker — veja o [README do backend](backend/README.md#rodar-no-computador)).
  - **Na nuvem:** hospedado numa EC2 do AWS Academy (Learner Lab), instalada pelo script
    [`backend/deploy/aws/instalar.sh`](backend/deploy/aws/instalar.sh) — passo a passo em
    [Publicar no AWS Academy](backend/README.md#publicar-no-aws-academy-learner-lab).


## Diagrama de Classes

```mermaid
classDiagram

class Doador {
    -string nome
    -string email
    -int id
}

class Representante {
    -string nome
    -string hospital
    -string email
    -int id
}

class Hospital {
    -string nome
    -string endereco
    -string bancoDeSangue
    -int idRepresentante
}

class Campanha {
    -string nome
    -string dataInicio
    -string dataFim
    -int id
    -string representante
    -string endereco
}

class BancoDeSangue {
    -int idHospital
    -string tipoDeSangue
    -int quantidadeDeSangue
}

Doador "1" -- "*" Hospital : doa 
Doador "1" -- "*" Campanha : participa
Representante "1" -- "1" Hospital : representa
Representante "1" -- "*" Campanha : cria
BancoDeSangue "1" -- "1" Hospital : pertence 
```

# Diagrama de implantação

```mermaid
flowchart TB

    %% =========================
    %% DISPOSITIVOS DOS USUÁRIOS
    %% =========================

    Doador["<<device>>\nDispositivo do Doador\n(Celular / Computador)"]
    DoadorApp["<<artifact>>\nAplicação Web/Mobile"]

    Representante["<<device>>\nDispositivo do Representante\n(Celular / Computador)"]
    RepresentanteApp["<<artifact>>\nAplicação Web/Mobile"]

    Doador -->|contém| DoadorApp
    Representante -->|contém| RepresentanteApp


    %% =========================
    %% AWS ACADEMY (LEARNER LAB)
    %% =========================

    subgraph AWS["<<cloud>> AWS Academy - Learner Lab"]
    subgraph EC2["<<node>> Instância EC2 - Ubuntu 24.04 + Docker"]

    %% =========================
    %% SERVIDOR DE APLICAÇÃO
    %% =========================

    subgraph AppServer["<<container>> Servidor de Aplicação - Python (FastAPI)"]

        Backend["<<component>>\nBackend\n(Python)"]
        Sistema["<<artifact>>\nSistema de Doação de Sangue"]

        API["<<component>>\nAPI\n(Python)"]
        APIREST["<<artifact>>\nAPI REST"]

        Backend -->|contém| Sistema
        API -->|contém| APIREST

        Backend <-->|Requisições internas| API
    end


    %% =========================
    %% BANCO DE DADOS
    %% =========================

    subgraph MySQL["<<container>> MySQL 8.4"]
        Database["<<artifact>>\nBanco de Dados\nSistema de Doação de Sangue"]
    end

    end
    end


    %% =========================
    %% CONEXÕES
    %% =========================

    DoadorApp -->|HTTP - porta 80| APIREST
    RepresentanteApp -->|HTTP - porta 80| APIREST

    Backend -->|SQL| Database


    %% =========================
    %% ESTILIZAÇÃO
    %% =========================

    classDef device fill:#d9ecff,stroke:#1976d2,stroke-width:2px,color:#111
    classDef server fill:#e5ddff,stroke:#673ab7,stroke-width:2px,color:#111
    classDef database fill:#ffdede,stroke:#c62828,stroke-width:2px,color:#111
    classDef cloud fill:#dff5df,stroke:#2e7d32,stroke-width:2px,color:#111
    classDef artifact fill:#f5f5f5,stroke:#555,stroke-width:1px,color:#111
    classDef component fill:#eee8ff,stroke:#673ab7,stroke-width:1px,color:#111

    class Doador,Representante device
    class AppServer server
    class MySQL database
    class AWS cloud
    class EC2 server
    class DoadorApp,RepresentanteApp,Sistema,APIREST,Database artifact
    class Backend,API component
```

# Diagrama de casos de Uso

```mermaid
flowchart LR

    Doador["Doador"]
    Representante["Representante do Hospital"]

    subgraph Sistema["Sistema de Doação de Sangue"]

        UC01(["UC01 - Visualizar e Selecionar Hospital"])
        UC02(["UC02 - Atualizar Informações do Hospital"])
        UC03(["UC03 - Visualizar Campanha"])
        UC04(["UC04 - Criar Campanha"])
        UC05(["UC05 - Doação Direta de Banco de Sangue"])

    end

    Doador --> UC01
    Doador --> UC03

    Representante --> UC02
    Representante --> UC03
    Representante --> UC04
    Representante --> UC05

    UC04 -.->|<<include>>| UC02
```
