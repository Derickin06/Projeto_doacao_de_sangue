"""Integração com o Google Maps (Geocoding API): endereço → coordenadas."""

import json
import logging
import urllib.parse
import urllib.request

from ..config import settings

logger = logging.getLogger(__name__)

_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json"


def geocodificar(endereco: str) -> tuple[float, float] | None:
    """Converte um endereço em (latitude, longitude) usando o Google Maps.

    Retorna ``None`` se não houver GOOGLE_MAPS_API_KEY configurada ou se a
    consulta falhar — o cadastro continua funcionando, só sem coordenadas.
    """
    if not settings.google_maps_api_key or not endereco:
        return None
    query = urllib.parse.urlencode(
        {"address": endereco, "key": settings.google_maps_api_key, "region": "br"}
    )
    try:
        with urllib.request.urlopen(f"{_GEOCODING_URL}?{query}", timeout=5) as resp:
            dados = json.load(resp)
    except Exception:  # rede fora do ar, timeout, JSON inválido...
        logger.warning("Falha ao geocodificar endereço", exc_info=True)
        return None
    if dados.get("status") != "OK" or not dados.get("results"):
        logger.info("Geocoding sem resultado (%s) para %r", dados.get("status"), endereco)
        return None
    loc = dados["results"][0]["geometry"]["location"]
    return float(loc["lat"]), float(loc["lng"])
