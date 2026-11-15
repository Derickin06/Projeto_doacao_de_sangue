// Cliente da API REST do backend (FastAPI).

import type {
  Campanha,
  CampanhaCriar,
  CampanhaModelo,
  EstoqueItem,
  Hospital,
  HospitalAtualizar,
  Representante,
} from './types';

const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
const CHAVE_TOKEN = 'hemoconnect.token';

/** Erro devolvido pela API, já com a mensagem pronta para mostrar na tela. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ----------------------------------------------------------------- token (login)
export function getToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    // navegação privada sem localStorage: o login dura só até recarregar a página
  }
  window.dispatchEvent(new Event('hemoconnect:auth'));
}

// --------------------------------------------------------------------- requisições
function mensagemDeErro(status: number, corpo: unknown): string {
  const detail = (corpo as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string') return detail;
  // Erros de validação do FastAPI: lista de { loc, msg }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((d: { msg?: string }) => (d.msg ?? '').replace(/^Value error, /, ''))
      .filter(Boolean)
      .join(' ');
  }
  if (status === 0) return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
  return `Erro inesperado (${status}). Tente novamente.`;
}

export async function request<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const headers = new Headers(opcoes.headers);
  if (opcoes.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let resposta: Response;
  try {
    resposta = await fetch(`${BASE}${caminho}`, { ...opcoes, headers });
  } catch {
    throw new ApiError(0, mensagemDeErro(0, null));
  }

  if (resposta.status === 204) return undefined as T;
  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    // Sessão expirada: limpa o token para o app voltar à tela de login
    if (resposta.status === 401 && token) setToken(null);
    throw new ApiError(resposta.status, mensagemDeErro(resposta.status, corpo));
  }
  return corpo as T;
}

// ------------------------------------------------------------------ campanhas (UC03)
export const api = {
  listarCampanhas: (params: { ativas?: boolean; hospital_id?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.ativas !== undefined) q.set('ativas', String(params.ativas));
    if (params.hospital_id !== undefined) q.set('hospital_id', String(params.hospital_id));
    const qs = q.toString();
    return request<Campanha[]>(`/campanhas${qs ? `?${qs}` : ''}`);
  },
  campanha: (id: number) => request<Campanha>(`/campanhas/${id}`),

  // -------------------------------------------------- representante do hospital
  login: async (email: string, senha: string) => {
    const r = await request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    setToken(r.access_token);
  },
  logout: () => setToken(null),
  eu: () => request<Representante>('/auth/me'),

  // ------------------------------------------------- UC02: atualizar o hospital
  meuHospital: () => request<Hospital>('/hospitais/me'),
  atualizarHospital: (dados: HospitalAtualizar) =>
    request<Hospital>('/hospitais/me', { method: 'PUT', body: JSON.stringify(dados) }),
  atualizarEstoque: (itens: EstoqueItem[]) =>
    request<Hospital>('/hospitais/me/estoque', { method: 'PUT', body: JSON.stringify(itens) }),

  // ------------------------------------------------------ UC04: criar campanha
  modeloCampanha: () => request<CampanhaModelo>('/campanhas/modelo'),
  criarCampanha: (dados: CampanhaCriar) =>
    request<Campanha>('/campanhas', { method: 'POST', body: JSON.stringify(dados) }),
};
