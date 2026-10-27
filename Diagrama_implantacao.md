@startuml

title Diagrama de Implantação - Sistema de Doação de Sangue

' =========================
' DISPOSITIVOS DOS USUÁRIOS
' =========================

node "Dispositivo do Doador" as DoadorDevice {
    artifact "Aplicação Web/Mobile" as DoadorApp
}

node "Dispositivo do Representante" as RepresentanteDevice {
    artifact "Aplicação Web/Mobile" as RepresentanteApp
}


' =========================
' SERVIDOR DE APLICAÇÃO
' =========================

node "Servidor de Aplicação" as AppServer {

    node "Backend" as Backend {
        artifact "Sistema de Doação de Sangue" as SistemaPython
    }

    node "API" as API {
        artifact "API REST - Python" as APIREST
    }
}


' =========================
' BANCO DE DADOS
' =========================

database "MySQL" as MySQL {
    artifact "Banco de Dados\nSistema de Doação de Sangue" as Database
}


' =========================
' CONEXÕES
' =========================

DoadorApp --> APIREST : HTTPS
RepresentanteApp --> APIREST : HTTPS

APIREST --> Backend : Requisições internas

Backend --> MySQL : SQL

@enduml

