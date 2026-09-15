# Projeto-Doação-de-Sangue-

# links auxiliares

Link Google Docs: https://docs.google.com/document/d/1fZguRS95zDG2ZQ4rsJeOO61aht4fMMbfmpGLaomVKtQ/edit?usp=sharing

Link Google Sheets: https://docs.google.com/spreadsheets/d/1bja-UOTeAVHtsSLmCIZyrKeJUPVNS2Ls6BIC09AyRK8/edit?usp=sharing

Link Figma: https://www.figma.com/make/pD13GNYTOk4aVPxW0MsAe0/Doa%C3%A7%C3%A3o-de-Sangue-App?t=81aICpOhMsjMJMW5-20&fullscreen=1


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
    %% SERVIDOR DE APLICAÇÃO
    %% =========================

    subgraph AppServer["<<node>> Servidor de Aplicação - Python"]

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

    subgraph MySQL["<<database>> MySQL"]
        Database["<<artifact>>\nBanco de Dados\nSistema de Doação de Sangue"]
    end


    %% =========================
    %% SERVIÇO EXTERNO
    %% =========================

    GoogleMaps["<<cloud>>\nGoogle Maps"]


    %% =========================
    %% CONEXÕES
    %% =========================

    DoadorApp -->|HTTPS| APIREST
    RepresentanteApp -->|HTTPS| APIREST

    Backend -->|SQL| Database

    Backend -->|HTTPS / Maps API| GoogleMaps


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
    class GoogleMaps cloud
    class DoadorApp,RepresentanteApp,Sistema,APIREST,Database artifact
    class Backend,API component
```