// Mesma regra ABO/Rh do backend (backend/app/services/compatibilidade.py).

import { TIPOS_SANGUINEOS } from './types';

const ABO_RECEPTORES: Record<string, string[]> = {
  O: ['O', 'A', 'B', 'AB'],
  A: ['A', 'AB'],
  B: ['B', 'AB'],
  AB: ['AB'],
};

function partes(tipo: string): [string, string] {
  return [tipo.slice(0, -1), tipo.slice(-1)];
}

/** O tipo `doador` pode doar para o tipo `receptor`? */
export function podeDoar(doador: string, receptor: string): boolean {
  const [aboD, rhD] = partes(doador);
  const [aboR, rhR] = partes(receptor);
  return (ABO_RECEPTORES[aboD] ?? []).includes(aboR) && (rhD === '-' || rhR === '+');
}

/** Tipos que podem doar para `receptor`. */
export function doadoresCompativeis(receptor: string): string[] {
  return TIPOS_SANGUINEOS.filter((t) => podeDoar(t, receptor));
}
