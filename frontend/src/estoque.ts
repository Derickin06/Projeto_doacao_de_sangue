// Status de demanda por tipo sanguíneo, com as cores e rótulos do protótipo.
// O protótipo escolhia o status manualmente; aqui ele é calculado a partir do
// estoque atual e do estoque mínimo que o hospital informa (dados do backend).

export type Status = 'critical' | 'high' | 'normal' | 'low';

export const STATUS: Record<Status, { rotulo: string; cor: string; fundo: string }> = {
  critical: { rotulo: 'Alta necessidade', cor: '#D94F3D', fundo: '#FAEAE8' },
  high: { rotulo: 'Necessidade moderada', cor: '#E8A045', fundo: '#FFF3ED' },
  normal: { rotulo: 'Normal', cor: '#6B9E7A', fundo: 'rgba(200,224,206,0.4)' },
  low: { rotulo: 'Baixa necessidade', cor: '#8C7B77', fundo: '#F2ECE7' },
};

/**
 * - Alta necessidade: menos da metade do mínimo
 * - Necessidade moderada: abaixo do mínimo
 * - Baixa necessidade: o dobro do mínimo ou mais (ou sem mínimo definido)
 * - Normal: entre o mínimo e o dobro dele
 */
export function statusDoEstoque(quantidade: number, minimo: number): Status {
  if (minimo <= 0) return 'low';
  if (quantidade < minimo / 2) return 'critical';
  if (quantidade < minimo) return 'high';
  if (quantidade >= minimo * 2) return 'low';
  return 'normal';
}
