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

Doador "1" -- "*" Hospital : doa para
Doador "1" -- "*" Campanha : participa
Representante "1" -- "1" Hospital : representa
Representante "1" -- "*" Campanha : cria
BancoDeSangue "1" -- "1" Hospital : pertence a
```