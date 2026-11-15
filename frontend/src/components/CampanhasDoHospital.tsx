// Lista das campanhas do hospital no painel, com o atalho para criar uma nova (UC04).

import { api } from '../api';
import { periodo, situacaoCampanha } from '../format';
import { navegar } from '../router';
import { useApi } from '../useApi';
import { TagsTipos } from './CampanhaCard';
import { Carregando, Erro } from './Estado';

interface Props {
  hospitalId: number;
}

export default function CampanhasDoHospital({ hospitalId }: Props) {
  const { dados: campanhas, erro, carregando, recarregar } = useApi(
    () => api.listarCampanhas({ ativas: false, hospital_id: hospitalId }),
    [hospitalId],
  );

  // Mais recentes primeiro (a API devolve em ordem de início)
  const lista = [...(campanhas ?? [])].reverse();

  return (
    <div className="card" style={{ padding: '26px 28px', marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Campanhas do hospital</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            Publique campanhas para chamar doadores dos tipos que estão em falta.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navegar('/painel/nova-campanha')} style={{ padding: '11px 22px', fontSize: 14 }}>
          + Nova campanha
        </button>
      </div>

      {carregando && <Carregando texto="Carregando campanhas..." />}
      {erro && <Erro mensagem={erro} onTentarDeNovo={recarregar} />}
      {!carregando && !erro && lista.length === 0 && (
        <div style={{ padding: '22px', background: 'var(--muted)', borderRadius: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Nenhuma campanha ainda</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Crie a primeira para ela aparecer na página de campanhas.</p>
        </div>
      )}

      {!carregando && lista.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {lista.map((c) => {
            const situacao = situacaoCampanha(c.data_inicio, c.data_fim);
            const cor = situacao.acontecendo ? 'var(--sage)' : situacao.encerrada ? 'var(--text-muted)' : 'var(--amber)';
            return (
              <div
                key={c.id}
                className="stack-mobile"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderTop: '1px solid var(--muted)', opacity: situacao.encerrada ? 0.6 : 1 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{c.nome}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--red)' }}>{periodo(c.data_inicio, c.data_fim)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: cor }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cor }} />
                      {situacao.texto}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  <TagsTipos tipos={c.tipos_necessarios} />
                </div>
                <button className="btn-secondary" onClick={() => navegar(`/campanhas/${c.id}`)} style={{ padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>
                  Ver página
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
