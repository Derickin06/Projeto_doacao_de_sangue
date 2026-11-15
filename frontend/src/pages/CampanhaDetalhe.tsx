// UC03 — Detalhes de uma campanha.

import { api } from '../api';
import { TagsTipos } from '../components/CampanhaCard';
import { Carregando, Erro } from '../components/Estado';
import { doadoresCompativeis } from '../compatibilidade';
import { dataCompleta, situacaoCampanha } from '../format';
import { navegar } from '../router';
import { useApi } from '../useApi';

interface Props {
  id: number;
}

const DICAS = [
  'Leve um documento oficial com foto.',
  'Tenha entre 16 e 69 anos (a primeira doação deve ser até os 60; menores de 18 precisam de autorização) e pelo menos 50 kg.',
  'Esteja descansado e alimentado; evite comidas gordurosas nas 3 horas anteriores.',
  'Não consuma bebida alcoólica nas 12 horas anteriores.',
];

export default function CampanhaDetalhe({ id }: Props) {
  const { dados: c, erro, carregando, recarregar } = useApi(() => api.campanha(id), [id]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px 60px' }}>
      <button className="btn-link" onClick={() => navegar('/campanhas')} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Voltar às campanhas
      </button>

      {carregando && <Carregando />}
      {erro && <Erro mensagem={erro} onTentarDeNovo={recarregar} />}

      {c && !carregando && (() => {
        const situacao = situacaoCampanha(c.data_inicio, c.data_fim);
        const corSituacao = situacao.acontecendo ? 'var(--sage)' : situacao.encerrada ? 'var(--text-muted)' : 'var(--amber)';
        return (
          <>
            {/* Cabeçalho da campanha */}
            <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🩸</div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>{c.nome}</h1>
                  <p style={{ fontSize: 14, color: 'var(--text)', margin: '0 0 4px', fontWeight: 700 }}>🏥 {c.hospital_nome}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px', fontWeight: 500 }}>📍 {c.endereco}</p>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                      📅 {c.data_inicio === c.data_fim ? dataCompleta(c.data_inicio) : `${dataCompleta(c.data_inicio)} a ${dataCompleta(c.data_fim)}`}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: corSituacao }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: corSituacao }} />
                      {situacao.texto}
                    </span>
                  </div>
                </div>
              </div>
              {c.descricao && (
                <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.65, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--muted)' }}>
                  {c.descricao}
                </p>
              )}
            </div>

            <div className="grid-2">
              {/* Tipos necessários */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 17, margin: '0 0 6px', color: 'var(--text)' }}>Tipos que mais precisam</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 16 }}>
                  {c.tipos_necessarios.length > 0 ? 'Doadores destes tipos (ou compatíveis) são prioridade.' : 'Esta campanha aceita doações de todos os tipos.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: c.tipos_necessarios.length > 0 ? 18 : 0 }}>
                  <TagsTipos tipos={c.tipos_necessarios} />
                </div>
                {c.tipos_necessarios.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {c.tipos_necessarios.map((t) => (
                      <div key={t} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--muted)', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Quem pode doar para {t}</span>
                        <span style={{ color: 'var(--text)', fontWeight: 800, textAlign: 'right' }}>{doadoresCompativeis(t).join(', ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Como participar */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 17, margin: '0 0 16px', color: 'var(--text)' }}>Antes de ir</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {DICAS.map((d) => (
                    <li key={d} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--sage)', fontWeight: 800 }}>✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 18, padding: '10px 14px', background: 'var(--muted)', borderRadius: 10 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                    ℹ️ Em caso de dúvida sobre os critérios, confirme com o hemocentro antes de ir.
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
