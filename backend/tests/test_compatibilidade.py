"""Testes da regra de compatibilidade sanguínea.
python -m unittest tests.test_compatibilidade
"""

import unittest

from app.services.compatibilidade import (
    TIPOS_SANGUINEOS,
    doadores_compativeis,
    negativo,
    normalizar_tipo,
    pode_doar,
    positivo,
    receptores_compativeis,
)

# Tabela de referência: receptor -> doadores aceitos
TABELA = {
    "O-": {"O-"},
    "O+": {"O-", "O+"},
    "A-": {"O-", "A-"},
    "A+": {"O-", "O+", "A-", "A+"},
    "B-": {"O-", "B-"},
    "B+": {"O-", "O+", "B-", "B+"},
    "AB-": {"O-", "A-", "B-", "AB-"},
    "AB+": set(TIPOS_SANGUINEOS),
}


class TestPodeDoar(unittest.TestCase):
    def test_casos_do_teste_java(self):
        # Mesmos casos de TipoSangueTest.testPodeDoar (formato "+A" do Java)
        self.assertTrue(pode_doar("+A", "+A"))
        self.assertTrue(pode_doar("-O", "+AB"))
        self.assertFalse(pode_doar("+B", "+A"))
        self.assertTrue(pode_doar("-AB", "+AB"))

    def test_tabela_completa(self):
        for receptor, doadores in TABELA.items():
            for doador in TIPOS_SANGUINEOS:
                with self.subTest(doador=doador, receptor=receptor):
                    self.assertEqual(pode_doar(doador, receptor), doador in doadores)

    def test_bugs_corrigidos_da_versao_java(self):
        # Java tratava AB como A: AB+ "podia" doar para A+
        self.assertFalse(pode_doar("AB+", "A+"))
        # Java não deixava A/B doarem para AB
        self.assertTrue(pode_doar("A+", "AB+"))
        self.assertTrue(pode_doar("B-", "AB-"))
        # Java não deixava O+ doar para outros positivos
        self.assertTrue(pode_doar("O+", "B+"))

    def test_listas_auxiliares(self):
        self.assertEqual(set(doadores_compativeis("A+")), TABELA["A+"])
        self.assertEqual(receptores_compativeis("AB+"), ["AB+"])
        self.assertEqual(len(receptores_compativeis("O-")), 8)


class TestNormalizacao(unittest.TestCase):
    def test_formatos_aceitos(self):
        self.assertEqual(normalizar_tipo("a+"), "A+")
        self.assertEqual(normalizar_tipo("+A"), "A+")
        self.assertEqual(normalizar_tipo(" -ab "), "AB-")
        self.assertEqual(normalizar_tipo("o -"), "O-")

    def test_tipos_invalidos(self):
        for invalido in ("", "C+", "A", "+", "ABO+", "A++"):
            with self.subTest(invalido=invalido), self.assertRaises(ValueError):
                normalizar_tipo(invalido)


class TestSinal(unittest.TestCase):
    def test_positivo_negativo(self):
        # Mesmos casos de testPositivo/testNegativo do Java
        self.assertTrue(positivo("+A"))
        self.assertFalse(positivo("-A"))
        self.assertTrue(positivo("+O"))
        self.assertTrue(negativo("-AB"))
        self.assertTrue(negativo("-O"))
        self.assertFalse(negativo("+O"))
        self.assertFalse(negativo("+AB"))


if __name__ == "__main__":
    unittest.main()
