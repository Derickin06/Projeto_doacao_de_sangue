@startuml

left to right direction

actor Doador
actor "Representante do Hospital" as Representante

rectangle "Sistema de Doação de Sangue" {

    usecase "UC01\nVisualizar e Selecionar Hospital" as UC01

    usecase "UC02\nAtualizar Informações do Hospital" as UC02

    usecase "UC03\nVisualizar Campanha" as UC03

    usecase "UC04\nCriar Campanha" as UC04

    usecase "UC05\nDoação Direta de Banco de Sangue" as UC05
}

Doador --> UC01
Doador --> UC03

Representante --> UC02
Representante --> UC03
Representante --> UC04
Representante --> UC05

UC04 ..> UC02 : <<include>>

@enduml