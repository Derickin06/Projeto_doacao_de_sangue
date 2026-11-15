// Formatos de dados devolvidos pela API (espelham backend/app/schemas.py).

export const TIPOS_SANGUINEOS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as const;
export type TipoSanguineo = (typeof TIPOS_SANGUINEOS)[number];

export interface Campanha {
  id: number;
  nome: string;
  descricao: string | null;
  data_inicio: string; // "AAAA-MM-DD"
  data_fim: string;
  endereco: string;
  tipos_necessarios: string[];
  hospital_id: number;
  hospital_nome: string;
  ativa: boolean;
}
