import type { Campanha } from '../types';
import { periodo, situacaoCampanha } from '../format';

interface Props {
  campanha: Campanha;
  layout: 'grid' | 'lista';
  onAbrir: () => void;
}

/** Tags dos tipos sanguíneos que a campanha mais precisa. */
export function TagsTipos({ tipos }: { tipos: string[] }) {
  if (tipos.length === 0) return <span className="tag-stable">Todos os tipos</span>;
  return (
    <>
      {tipos.map((t) => (
        <span key={t} className="tag-urgent">🔴 {t}</span>
      ))}
    </>
  );
}

export default function CampanhaCard({ campanha: c, layout, onAbrir }: Props) {
  const situacao = situacaoCampanha(c.data_inicio, c.data_fim);
  const corSituacao = situacao.acontecendo ? 'var(--sage)' : situacao.encerrada ? 'var(--text-muted)' : 'var(--amber)';
  const grid = layout === 'grid';

  return (
    <div
      className="card card-hover stack-mobile"
      style={{ padding: grid ? '24px' : '20px 24px', display: 'flex', flexDirection: grid ? 'column' : 'row', alignItems: grid ? 'stretch' : 'center', gap: 16 }}
    >
      {/* Ícone */}
      <div style={{ width: 48, height: 48, borderRadius: 14, background: situacao.encerrada ? 'var(--muted)' : 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        🩸
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text)', lineHeight: 1.3, fontFamily: 'Fraunces, serif' }}>{c.nome}</h3>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)', flexShrink: 0, whiteSpace: 'nowrap' }}>{periodo(c.data_inicio, c.data_fim)}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 2px', fontWeight: 700 }}>🏥 {c.hospital_nome}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 500 }}>{c.endereco}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: corSituacao, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: corSituacao, fontWeight: 700 }}>{situacao.texto}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          <TagsTipos tipos={c.tipos_necessarios} />
        </div>
      </div>

      {/* Ação */}
      <div style={{ flexShrink: 0, marginTop: grid ? 4 : 0 }}>
        <button
          className="btn-primary"
          onClick={onAbrir}
          style={{ padding: grid ? '11px 0' : '10px 20px', width: grid ? '100%' : 'auto', fontSize: 14 }}
        >
          Ver detalhes →
        </button>
      </div>
    </div>
  );
}
