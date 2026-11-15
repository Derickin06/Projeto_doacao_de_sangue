/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endereço da API. Padrão: "/api" (o Vite em dev e o nginx em produção repassam para o backend). */
  readonly VITE_API_URL?: string;
}
