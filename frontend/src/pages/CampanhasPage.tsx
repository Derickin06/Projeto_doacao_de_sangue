// UC03 — Visualizar campanhas (público, sem login).

import { useMemo, useState } from 'react';
import { api } from '../api';
import CampanhaCard from '../components/CampanhaCard';
import { Carregando, Erro, Vazio } from '../components/Estado';
import { podeDoar } from '../compatibilidade';
import { situacaoCampanha } from '../format';
import { navegar } from '../router';
import { TIPOS_SANGUINEOS } from '../types';
import { useApi } from '../useApi';

type Filtro = 'todas' | 'agora' | 'breve';

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'agora', rotulo: '🔴 Acontecendo agora' },
  { valor: 'breve', rotulo: '📅 Em breve' },
];

interface Props {
  buscaInicial?: string;
}

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function CampanhasPage({ buscaInicial = '' }: Props) {
  const [busca, setBusca] = useState(buscaInicial);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [meuTipo, setMeuTipo] = useState('');
  const [layout, setLayout] = useState<'grid' | 'lista'>('grid');
  const { dados: campanhas, erro, carregando, recarregar } = useApi(() => api.listarCampanhas({ ativas: true }));

  const filtradas = useMemo(() => {
    const q = semAcento(busca.trim());
    return (campanhas ?? []).filter((c) => {
      const texto = semAcento(`${c.nome} ${c.hospital_nome} ${c.endereco} ${c.descricao ?? ''}`);
      if (q && !texto.includes(q)) return false;
      const situacao = situacaoCampanha(c.data_inicio, c.data_fim);
      if (filtro === 'agora' && !situacao.acontecendo) return false;
      if (filtro === 'breve' && situacao.acontecendo) return false;
      // Meu tipo: mostra as campanhas em que o doador consegue ajudar
      if (meuTipo && c.tipos_necessarios.length > 0 && !c.tipos_necessarios.some((t) => podeDoar(meuTipo, t))) return false;
      return true;
    });
  }, [campanhas, busca, filtro, meuTipo]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px 60px' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Campanhas de doação</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
          {carregando ? 'Buscando campanhas...' : `${filtradas.length} ${filtradas.length === 1 ? 'campanha encontrada' : 'campanhas encontradas'}`}
        </p>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none' }}>🔍</span>
          <input
            className="input-field"
            style={{ paddingLeft: 38 }}
            type="text"
            placeholder="Filtrar por nome, hemocentro ou endereço..."
            aria-label="Filtrar campanhas"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              style={{
                padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: '1.5px solid',
                fontFamily: 'Nunito, sans-serif', cursor: 'pointer', transition: 'all 0.15s',
                borderColor: filtro === f.valor ? 'var(--red)' : 'var(--border)',
                background: filtro === f.valor ? 'var(--red-light)' : 'var(--card)',
                color: filtro === f.valor ? 'var(--red)' : 'var(--text-muted)',
              }}
            >
              {f.rotulo}
            </button>
          ))}
        </div>

        <select
          className="input-field"
          aria-label="Meu tipo sanguíneo"
          value={meuTipo}
          onChange={(e) => setMeuTipo(e.target.value)}
          style={{ width: 'auto', minWidth: 170, backgroundColor: 'var(--card)', fontWeight: 700, color: meuTipo ? 'var(--red)' : 'var(--text-muted)' }}
        >
          <option value="">Meu tipo sanguíneo</option>
          {TIPOS_SANGUINEOS.map((t) => (
            <option key={t} value={t}>Sou {t}</option>
          ))}
        </select>

        <div className="hide-mobile" style={{ display: 'flex', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: 3 }}>
          {(['grid', 'lista'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setLayout(v)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                background: layout === v ? 'var(--red-light)' : 'none',
                color: layout === v ? 'var(--red)' : 'var(--text-muted)',
                fontWeight: 700,
              }}
            >
              {v === 'grid' ? '⊞ Grid' : '≡ Lista'}
            </button>
          ))}
        </div>
      </div>

      {meuTipo && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, margin: '-12px 0 20px' }}>
          Mostrando campanhas em que quem é <strong style={{ color: 'var(--red)' }}>{meuTipo}</strong> pode ajudar.
        </p>
      )}

      {carregando && <Carregando texto="Buscando campanhas..." />}
      {erro && <Erro mensagem={erro} onTentarDeNovo={recarregar} />}

      {!carregando && !erro && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))' : '1fr',
              gap: 18,
            }}
          >
            {filtradas.map((c) => (
              <CampanhaCard key={c.id} campanha={c} layout={layout} onAbrir={() => navegar(`/campanhas/${c.id}`)} />
            ))}
          </div>

          {filtradas.length === 0 &&
            ((campanhas ?? []).length === 0 ? (
              <Vazio icone="🩸" titulo="Nenhuma campanha ativa no momento" texto="Volte em breve: os hemocentros publicam novas campanhas com frequência." />
            ) : (
              <Vazio titulo="Nenhum resultado encontrado" texto="Tente outro termo ou remova os filtros." />
            ))}
        </>
      )}
    </div>
  );
}
