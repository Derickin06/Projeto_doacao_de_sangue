import { useSyncExternalStore } from 'react';
import { getToken } from './api';

function inscrever(callback: () => void) {
  window.addEventListener('hemoconnect:auth', callback); // login/logout nesta aba
  window.addEventListener('storage', callback); // login/logout em outra aba
  return () => {
    window.removeEventListener('hemoconnect:auth', callback);
    window.removeEventListener('storage', callback);
  };
}

/** O representante do hospital está logado? Atualiza a tela ao entrar/sair. */
export function useLogado(): boolean {
  return useSyncExternalStore(inscrever, () => getToken() !== null, () => false);
}
