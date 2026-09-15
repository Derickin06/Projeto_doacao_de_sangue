

@startuml

class Doador {
    - nome : string
    - email : string
    - id : int
}

class Representante {
    - nome : string
    - hospital : string
    - email : string
    - id : int
}

class Hospital {
    - nome : string
    - endereco : string
    - bancoDeSangue : string
    - idRepresentante : int
}

class Campanha {
    - nome : string
    - dataInicio : string
    - dataFim : string
    - id : int
    - representante : string
    - endereco : string
}

class "Banco de Sangue" as BancoDeSangue {
    - idHospital : int
    - tipoDeSangue : string
    - quantidadeDeSangue : int
}

Doador "1" -- "*" Hospital : doa para
Doador "1" -- "*" Campanha : participa
Representante "1" -- "1" Hospital : representa
Representante "1" -- "*" Campanha : cria
BancoDeSangue "1" -- "1" Hospital : pertence a

@enduml