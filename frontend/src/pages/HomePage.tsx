import { useState } from 'react';
import { api } from '../api';
import { navegar } from '../router';
import { useApi } from '../useApi';

const PASSOS = [
  { passo: '01', icone: '🔍', titulo: 'Busque', texto: 'Veja as campanhas de doação ativas e filtre por cidade, hemocentro ou pelo seu tipo sanguíneo.' },
  { passo: '02', icone: '🩸', titulo: 'Escolha', texto: 'Confira os tipos de sangue que cada campanha mais precisa e priorize onde sua doação terá mais impacto.' },
  { passo: '03', icone: '📍', titulo: 'Compareça', texto: 'Vá ao local no período da campanha levando um documento oficial com foto. Não precisa de cadastro.' },
];

export default function HomePage() {
  const [busca, setBusca] = useState('');
  const { dados: campanhas } = useApi(() => api.listarCampanhas({ ativas: true }));

  const totalCampanhas = campanhas?.length;
  const totalHospitais = campanhas ? new Set(campanhas.map((c) => c.hospital_id)).size : undefined;

  const buscar = () => {
    const q = busca.trim();
    navegar(q ? `/campanhas?busca=${encodeURIComponent(q)}` : '/campanhas');
  };

  const numeros = [
    { valor: totalCampanhas ?? '–', rotulo: 'campanhas ativas' },
    { valor: totalHospitais ?? '–', rotulo: 'hemocentros com campanhas' },
    { valor: '4 vidas', rotulo: 'salvas por doação' },
  ];

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(160deg, #FAF7F4 0%, #F7EDE8 60%, #EDE8F2 100%)',
          minHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px 24px 60px',
          textAlign: 'center',
        }}
      >
        {/* Selo */}
        {totalCampanhas !== undefined && totalCampanhas > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--red-light)', border: '1px solid rgba(217,79,61,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 28 }}>
            <span className="pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--red)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {totalCampanhas === 1 ? '1 campanha ativa agora' : `${totalCampanhas} campanhas ativas agora`}
            </span>
          </div>
        )}

        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 'clamp(36px, 6vw, 62px)',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.15,
            maxWidth: 680,
            margin: '0 0 18px',
          }}
        >
          Doe sangue.<br />
          <span style={{ color: 'var(--red)' }}>Salve até 4 vidas.</span>
        </h1>

        <p style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 460, lineHeight: 1.65, margin: '0 0 44px', fontWeight: 500 }}>
          Encontre campanhas de doação perto de você e veja quais tipos de sangue os hemocentros mais precisam.
        </p>

        {/* Busca */}
        <div
          className="stack-mobile"
          style={{
            background: 'var(--card)',
            border: '1.5px solid var(--border)',
            borderRadius: 18,
            padding: '8px 8px 8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 8px 32px rgba(42,26,24,0.08)',
          }}
        >
          <span className="hide-mobile" style={{ fontSize: 18, flex: 'none' }}>🔍</span>
          <input
            type="text"
            placeholder="Cidade, bairro ou hemocentro..."
            aria-label="Buscar campanhas"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            style={{
              flex: 1, border: 'none', background: 'none', outline: 'none', minWidth: 0, padding: '8px 0',
              fontFamily: 'Nunito, sans-serif', fontSize: 15, color: 'var(--text)',
            }}
          />
          <button
            className="btn-primary"
            onClick={buscar}
            style={{ padding: '11px 24px', fontSize: 14, borderRadius: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Encontrar campanha
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14, fontWeight: 600 }}>
          Gratuito · Sem cadastro para doadores
        </p>
      </section>

      {/* Números */}
      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
          {numeros.map((n, i) => (
            <div key={n.rotulo} style={{ textAlign: 'center', padding: '0 12px', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: 'var(--red)', margin: '0 0 4px' }}>{n.valor}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>{n.rotulo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 700, marginBottom: 48, color: 'var(--text)' }}>Como funciona</h2>
        <div className="grid-3">
          {PASSOS.map((item) => (
            <div key={item.passo} className="card card-hover" style={{ padding: '32px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: 13, fontWeight: 700, color: 'var(--red)', opacity: 0.5 }}>{item.passo}</span>
                <span style={{ fontSize: 28 }}>{item.icone}</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>{item.titulo}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{item.texto}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn-primary" onClick={() => navegar('/campanhas')} style={{ padding: '14px 36px', fontSize: 15 }}>
            Ver campanhas agora →
          </button>
        </div>
      </section>
    </div>
  );
}
