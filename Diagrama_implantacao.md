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
' AWS ACADEMY (LEARNER LAB)
' =========================

cloud "AWS Academy - Learner Lab" as AWS {
node "Instância EC2 - Ubuntu 24.04 + Docker" as EC2 {

' =========================
' SERVIDOR WEB (SITE)
' =========================

node "Servidor Web - nginx" as WebServer <<container>> {
    artifact "Site React (HemoConnect)" as Site
}


' =========================
' SERVIDOR DE APLICAÇÃO
' =========================

node "Servidor de Aplicação - Python (FastAPI)" as AppServer <<container>> {

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

database "MySQL 8.4" as MySQL <<container>> {
    artifact "Banco de Dados\nSistema de Doação de Sangue" as Database
}

}
}


' =========================
' CONEXÕES
' =========================

DoadorApp --> Site : HTTP (porta 80)
RepresentanteApp --> Site : HTTP (porta 80)

Site --> APIREST : /api (proxy reverso)

APIREST --> Backend : Requisições internas

Backend --> MySQL : SQL

@enduml

