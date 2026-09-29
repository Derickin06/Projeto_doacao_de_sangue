package com.mackenzie;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 *
 * @author Gustavo
 */
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

public class TipoSangueTest {

    TipoSangue tipo;

    String A = "+A";
    String An = "-A";
    String B = "+B";
    String Bn = "-B";
    String AB = "+AB";
    String ABn = "-AB";
    String O = "+O";
    String On = "-O";

    public TipoSangueTest() {
        tipo = new TipoSangue();
    }

    @Test
    public void testPodeDoar() {

        System.out.println("Teste se pode doar\n");

        // A+ pode doar para A+
        assertTrue(tipo.podedoar(A, A));

        // O- pode doar para AB+
        assertTrue(tipo.podedoar(On, AB));

        // B+ NÃO pode doar para A+
        assertFalse(tipo.podedoar(B, A));

        // AB- pode doar para AB+
        assertTrue(tipo.podedoar(ABn, AB));
    }

    @Test
    public void testNegativo() {

        System.out.println("Teste se é negativo ou não\n");

        // A+ não é negativo
        assertFalse(tipo.negativo(A));

        // AB- é negativo
        assertTrue(tipo.negativo(ABn));

        // O- é negativo
        assertTrue(tipo.negativo(On));

        // O+ não é negativo
        assertFalse(tipo.negativo(O));

        // AB+ não é negativo
        assertFalse(tipo.negativo(AB));
    }

    @Test
    public void testPositivo() {

        System.out.println("Teste se é positivo ou não\n");

        // A+ é positivo
        assertTrue(tipo.positivo(A));

        // A- não é positivo
        assertFalse(tipo.positivo(An));

        // O+ é positivo
        assertTrue(tipo.positivo(O));

        // B+ é positivo
        assertTrue(tipo.positivo(B));

        // AB+ é positivo
        assertTrue(tipo.positivo(AB));
    }
}
