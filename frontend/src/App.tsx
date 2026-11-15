import Nav from './components/Nav';
import CampanhaDetalhe from './pages/CampanhaDetalhe';
import CampanhasPage from './pages/CampanhasPage';
import HomePage from './pages/HomePage';
import NaoEncontrada from './pages/NaoEncontrada';
import { lerRota, useRota } from './router';

function Pagina({ rota }: { rota: string }) {
  const { partes, params } = lerRota(rota);
  const [secao, id] = partes;

  if (!secao) return <HomePage />;
  if (secao === 'campanhas' && !id) return <CampanhasPage key={rota} buscaInicial={params.get('busca') ?? ''} />;
  if (secao === 'campanhas' && /^\d+$/.test(id)) return <CampanhaDetalhe id={Number(id)} />;
  return <NaoEncontrada />;
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
