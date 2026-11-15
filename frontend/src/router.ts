// Navegação simples por "hash" (#/campanhas, #/painel...), sem bibliotecas.
// Com hash, recarregar a página ou abrir um link direto funciona em qualquer servidor.

import { useSyncExternalStore } from 'react';

/** Caminho atual lido direto da barra de endereço. */
export function rotaAtual(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash.startsWith('/') ? hash : '/';
}

function inscrever(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

/** Caminho atual, ex.: "/campanhas/3". Re-renderiza quando muda. */
export function useRota(): string {
  return useSyncExternalStore(inscrever, rotaAtual, () => '/');
}

export function navegar(caminho: string): void {
  if (rotaAtual() !== caminho) window.location.hash = caminho;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Separa "/campanhas/3?tipo=O-" em partes e parâmetros. */
export function lerRota(caminho: string): { partes: string[]; params: URLSearchParams } {
  const [path, query = ''] = caminho.split('?');
  return { partes: path.split('/').filter(Boolean), params: new URLSearchParams(query) };
}
