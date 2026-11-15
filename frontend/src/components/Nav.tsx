import { api } from '../api';
import { useLogado } from '../auth';
import { navegar } from '../router';

interface Props {
  rota: string;
}

const LINKS = [
  { caminho: '/', rotulo: 'Home' },
  { caminho: '/campanhas', rotulo: 'Campanhas' },
];

export default function Nav({ rota }: Props) {
  const logado = useLogado();
  const noPainel = rota.startsWith('/painel');
  const ativo = (caminho: string) => (caminho === '/' ? rota === '/' : rota.startsWith(caminho));

  const sair = () => {
    api.logout();
    navegar('/');
  };

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(250,247,244,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="nav-bar" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Logo */}
        <button
          onClick={() => navegar('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#D94F3D,#F0856A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 3px 10px rgba(217,79,61,0.3)' }}>
            🩸
          </div>
          <span className="hide-mobile" style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>HemoConnect</span>
        </button>

        {/* Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {LINKS.map((item) => (
            <button
              key={item.caminho}
              className="nav-link"
              onClick={() => navegar(item.caminho)}
              style={{
                background: ativo(item.caminho) ? 'var(--red-light)' : 'none',
                border: 'none',
                borderRadius: 10,
                padding: '7px 16px',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'Nunito, sans-serif',
                color: ativo(item.caminho) ? 'var(--red)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {item.rotulo}
            </button>
          ))}
        </nav>

        {/* Acesso do hospital */}
        {noPainel && logado ? (
          <button onClick={sair} className="btn-secondary nav-cta" style={{ padding: '8px 18px', fontSize: 13, whiteSpace: 'nowrap' }}>
            ← Sair<span className="hide-mobile"> do painel</span>
          </button>
        ) : (
          <button
            onClick={() => navegar(logado ? '/painel' : '/login')}
            className="btn-primary nav-cta"
            style={{ padding: '8px 18px', fontSize: 13, whiteSpace: 'nowrap' }}
          >
            {logado ? 'Meu painel' : <><span className="hide-mobile">Acesso do </span>Hospital</>}
          </button>
        )}
      </div>
    </header>
  );
}
