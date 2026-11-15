import { useEffect, type ReactNode } from 'react';
import { useLogado } from './auth';
import Nav from './components/Nav';
import CampanhaDetalhe from './pages/CampanhaDetalhe';
import CampanhasPage from './pages/CampanhasPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NovaCampanhaPage from './pages/NovaCampanhaPage';
import NaoEncontrada from './pages/NaoEncontrada';
import PainelPage from './pages/PainelPage';
import { lerRota, navegar, rotaAtual, useRota } from './router';

/** Páginas que exigem o representante do hospital logado. */
function Protegida({ children }: { children: ReactNode }) {
  const logado = useLogado();
  useEffect(() => {
    // Ao clicar em "Sair" o app já está indo para outra página: só redireciona
    // para o login se a pessoa ainda estiver numa página protegida.
    if (!logado && rotaAtual().startsWith('/painel')) navegar('/login');
  }, [logado]);
  return logado ? <>{children}</> : null;
}

function Pagina({ rota }: { rota: string }) {
  const { partes, params } = lerRota(rota);
  const [secao, id] = partes;
  const logado = useLogado();

  if (!secao) return <HomePage />;
  if (secao === 'campanhas' && !id) return <CampanhasPage key={rota} buscaInicial={params.get('busca') ?? ''} />;
  if (secao === 'campanhas' && /^\d+$/.test(id)) return <CampanhaDetalhe id={Number(id)} />;
  if (secao === 'login') return logado ? <Redirecionar para="/painel" /> : <LoginPage />;
  if (secao === 'painel' && !id) return <Protegida><PainelPage /></Protegida>;
  if (secao === 'painel' && id === 'nova-campanha') return <Protegida><NovaCampanhaPage /></Protegida>;
  return <NaoEncontrada />;
}

function Redirecionar({ para }: { para: string }) {
  useEffect(() => navegar(para), [para]);
  return null;
}

export default function App() {
  const rota = useRota();
  return (
    <>
      <Nav rota={rota} />
      <main>
        <Pagina rota={rota} />
      </main>
    </>
  );
}
