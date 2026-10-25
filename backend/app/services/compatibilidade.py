"""Regras de compatibilidade sanguínea (sistemas ABO e Rh).

Port em Python da classe Java ``TipoSangue`` (main.java), com duas correções:

* a versão Java comparava só o 2º caractere (``"+AB"`` virava ``A``), então
  AB era tratado como A, e B/A nunca podiam doar para AB;
* um doador negativo de mesma letra não era tratado de forma consistente
  com O+ (que pode doar para qualquer tipo positivo).

Regras usadas:
* ABO: O doa para todos; A doa para A e AB; B doa para B e AB; AB só para AB.
* Rh:  Rh- doa para Rh- e Rh+; Rh+ só para Rh+.
"""

TIPOS_SANGUINEOS: tuple[str, ...] = ("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+")

_ABO_RECEPTORES: dict[str, set[str]] = {
    "O": {"O", "A", "B", "AB"},
    "A": {"A", "AB"},
    "B": {"B", "AB"},
    "AB": {"AB"},
}


def normalizar_tipo(tipo: str) -> str:
    """Converte ``"a+"``, ``"+A"`` ou ``" AB- "`` para o formato padrão ``"A+"``/``"AB-"``.

    Aceita também o formato com sinal na frente usado no código Java (``"+AB"``).
    Lança ``ValueError`` se o tipo não existir.
    """
    if not isinstance(tipo, str):
        raise ValueError("Tipo sanguíneo deve ser texto.")
    valor = tipo.strip().upper().replace(" ", "")
    if valor[:1] in "+-" and len(valor) > 1:
        valor = valor[1:] + valor[0]
    if valor not in TIPOS_SANGUINEOS:
        raise ValueError(
            f"Tipo sanguíneo inválido: {tipo!r}. Use um de: {', '.join(TIPOS_SANGUINEOS)}."
        )
    return valor


def _partes(tipo: str) -> tuple[str, str]:
    t = normalizar_tipo(tipo)
    return t[:-1], t[-1]


def pode_doar(doador: str, receptor: str) -> bool:
    """O tipo ``doador`` pode doar para o tipo ``receptor``?"""
    abo_d, rh_d = _partes(doador)
    abo_r, rh_r = _partes(receptor)
    abo_ok = abo_r in _ABO_RECEPTORES[abo_d]
    rh_ok = rh_d == "-" or rh_r == "+"
    return abo_ok and rh_ok


def doadores_compativeis(receptor: str) -> list[str]:
    """Tipos que podem doar para ``receptor``."""
    return [t for t in TIPOS_SANGUINEOS if pode_doar(t, receptor)]


def receptores_compativeis(doador: str) -> list[str]:
    """Tipos que podem receber de ``doador``."""
    return [t for t in TIPOS_SANGUINEOS if pode_doar(doador, t)]


def positivo(tipo: str) -> bool:
    return normalizar_tipo(tipo).endswith("+")


def negativo(tipo: str) -> bool:
    return normalizar_tipo(tipo).endswith("-")
