import { Vazio } from '../components/Estado';
import { navegar } from '../router';

export default function NaoEncontrada() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 24px 60px', textAlign: 'center' }}>
      <Vazio icone="🧭" titulo="Página não encontrada" texto="O endereço pode estar errado ou a página foi removida." />
      <button className="btn-primary" onClick={() => navegar('/')} style={{ padding: '12px 28px', fontSize: 14 }}>
        Voltar ao início
      </button>
    </div>
  );
}
