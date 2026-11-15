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

export interface EstoqueTipo {
  tipo_sanguineo: string;
  quantidade: number; // bolsas disponíveis
  quantidade_minima: number; // estoque ideal
  necessidade: number; // quanto falta para o mínimo
}

export interface Hospital {
  id: number;
  nome: string;
  endereco: string;
  telefone: string | null;
  horario_funcionamento: string | null;
  observacoes: string | null; // exceções de funcionamento e avisos
  tipos_em_falta: string[];
  estoque: EstoqueTipo[];
}

export interface Representante {
  id: number;
  nome: string;
  email: string;
  hospital: Hospital | null;
}

export interface HospitalAtualizar {
  nome?: string;
  endereco?: string;
  telefone?: string | null;
  horario_funcionamento?: string | null;
  observacoes?: string | null;
}

export interface EstoqueItem {
  tipo_sanguineo: string;
  quantidade: number;
  quantidade_minima: number;
}
