package com.mackenzie;

public class TipoSangue {

    // A pode doar para B?
    public boolean podedoar(String A, String B) {

        if (A.charAt(1) == B.charAt(1)) {

            if (positivo(A) && positivo(B)) {
                return true;
            }

            if (negativo(A)) {
                return true;
            } else {
                return false;
            }
        }

        if (A.charAt(1) == 'O' && negativo(A)) {
            return true;
        } else {
            return false;
        }
    }

    public boolean positivo(String A) {
        if (A.charAt(0) == '+') {
            return true;
        } else {
            return false;
        }
    }

    public boolean negativo(String A) {
        if (A.charAt(0) == '-') {
            return true;
        } else {
            return false;
        }
    }
}