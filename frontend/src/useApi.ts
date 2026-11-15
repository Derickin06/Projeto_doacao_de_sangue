import { useCallback, useEffect, useState } from 'react';

interface Resultado<T> {
  dados: T | null;
  erro: string | null;
  carregando: boolean;
  recarregar: () => void;
}

/** Busca dados da API ao montar a tela (e quando `deps` mudam). */
export function useApi<T>(buscar: () => Promise<T>, deps: unknown[] = []): Resultado<T> {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    buscar()
      .then((d) => { if (!cancelado) setDados(d); })
      .catch((e: Error) => {
        if (cancelado) return;
        setDados(null); // não mostrar dados antigos (ex.: de outra campanha) junto com o erro
        setErro(e.message);
      })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versao, ...deps]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  return { dados, erro, carregando, recarregar };
}
