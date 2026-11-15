// UC04 — Criar campanha. O formulário vem pré-preenchido com os dados do hospital
// (endereço e tipos sanguíneos em falta), que o representante pode ajustar.

import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api';
import CampanhaCard from '../components/CampanhaCard';
import { Carregando, Erro } from '../components/Estado';
import { dataCompleta, hojeISO } from '../format';
import { navegar } from '../router';
import { TIPOS_SANGUINEOS, type Campanha } from '../types';
import { useApi } from '../useApi';

interface Form {
  nome: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  endereco: string;
  tipos: string[];
}

function validar(f: Form): string | null {
  if (f.nome.trim().length < 3) return 'Dê um nome à campanha (pelo menos 3 letras).';
  if (!f.data_inicio || !f.data_fim) return 'Informe as datas de início e fim.';
  if (f.data_fim < f.data_inicio) return 'A data final não pode ser antes da data de início.';
  if (f.data_fim < hojeISO()) return 'A campanha não pode terminar no passado.';
  if (f.endereco.trim().length < 5) return 'Informe o endereço onde a coleta vai acontecer.';
  return null;
}

export default function NovaCampanhaPage() {
  const { dados: modelo, erro, carregando, recarregar } = useApi(() => api.modeloCampanha());
  const [form, setForm] = useState<Form | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [criada, setCriada] = useState<Campanha | null>(null);

  useEffect(() => {
    if (!modelo) return;
    setForm({
      nome: '',
      descricao: '',
      data_inicio: hojeISO(),
      data_fim: '',
      endereco: modelo.endereco,
      tipos: modelo.tipos_necessarios,
    });
  }, [modelo]);

  if (carregando) return <div style={{ paddingTop: 84 }}><Carregando texto="Preparando o formulário..." /></div>;
  if (erro || !modelo || !form) {
    return <div style={{ paddingTop: 84 }}><Erro mensagem={erro ?? 'Não foi possível carregar o formulário.'} onTentarDeNovo={recarregar} /></div>;
  }

  const mudar = <K extends keyof Form>(campo: K, valor: Form[K]) => {
    setForm((f) => (f ? { ...f, [campo]: valor } : f));
    setErroEnvio('');
  };

  const alternarTipo = (t: string) =>
    mudar('tipos', form.tipos.includes(t) ? form.tipos.filter((x) => x !== t) : TIPOS_SANGUINEOS.filter((x) => x === t || form.tipos.includes(x)));

  const publicar = async (e: FormEvent) => {
    e.preventDefault();
    const problema = validar(form);
    if (problema) {
      setErroEnvio(problema);
      return;
    }
    setEnviando(true);
    setErroEnvio('');
    try {
      const campanha = await api.criarCampanha({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        endereco: form.endereco.trim(),
        tipos_necessarios: form.tipos,
      });
      setCriada(campanha);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErroEnvio((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  // ----------------------------------------------------------- tela de sucesso
  if (criada) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>
        <div className="success-in" style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#6B9E7A,#4A7A58)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 24px', boxShadow: '0 12px 36px rgba(107,158,122,0.3)' }}>
            ✅
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Campanha publicada!</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
            Ela já aparece para os doadores na página de campanhas.
          </p>
          <div className="card" style={{ padding: '22px 24px', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Resumo</p>
            {[
              { rotulo: 'Campanha', valor: criada.nome },
              { rotulo: 'Período', valor: criada.data_inicio === criada.data_fim ? dataCompleta(criada.data_inicio) : `${dataCompleta(criada.data_inicio)} a ${dataCompleta(criada.data_fim)}` },
              { rotulo: 'Local', valor: criada.endereco },
              { rotulo: 'Tipos necessários', valor: criada.tipos_necessarios.join(', ') || 'Todos' },
            ].map((r) => (
              <div key={r.rotulo} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--muted)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>{r.rotulo}</span>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 800, textAlign: 'right' }}>{r.valor}</span>
              </div>
            ))}
          </div>
          <div className="stack-mobile" style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={() => navegar(`/campanhas/${criada.id}`)} style={{ flex: 1, padding: '13px 0', fontSize: 14 }}>
              Ver página da campanha
            </button>
            <button className="btn-secondary" onClick={() => navegar('/painel')} style={{ flex: 1, padding: '13px 0', fontSize: 14 }}>
              Voltar ao painel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- formulário
  const previa: Campanha = {
    id: 0,
    nome: form.nome.trim() || 'Nome da campanha',
    descricao: form.descricao || null,
    data_inicio: form.data_inicio || hojeISO(),
    data_fim: form.data_fim || form.data_inicio || hojeISO(),
    endereco: form.endereco || modelo.endereco,
    tipos_necessarios: form.tipos,
    hospital_id: modelo.hospital_id,
    hospital_nome: modelo.hospital_nome,
    ativa: true,
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '84px 24px 60px' }}>
      <button className="btn-link" onClick={() => navegar('/painel')} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Voltar ao painel
      </button>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Nova campanha</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{modelo.hospital_nome}</p>
      </div>

      <form onSubmit={publicar} noValidate>
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Formulário */}
          <div className="card" style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label" htmlFor="c-nome">Nome da campanha *</label>
              <input id="c-nome" className="input-field" placeholder="Ex.: Doe sangue no fim de semana" value={form.nome} onChange={(e) => mudar('nome', e.target.value)} maxLength={150} />
            </div>
            <div>
              <label className="field-label" htmlFor="c-descricao">Descrição</label>
              <textarea id="c-descricao" className="input-field" placeholder="Conte aos doadores o objetivo da campanha, horários e o que levar." value={form.descricao} onChange={(e) => mudar('descricao', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="field-label" htmlFor="c-inicio">Início *</label>
                <input id="c-inicio" className="input-field" type="date" value={form.data_inicio} onChange={(e) => mudar('data_inicio', e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="c-fim">Fim *</label>
                <input id="c-fim" className="input-field" type="date" min={form.data_inicio || hojeISO()} value={form.data_fim} onChange={(e) => mudar('data_fim', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="c-endereco">Local da coleta *</label>
              <input id="c-endereco" className="input-field" value={form.endereco} onChange={(e) => mudar('endereco', e.target.value)} maxLength={255} />
              {form.endereco !== modelo.endereco && (
                <button type="button" className="btn-link" onClick={() => mudar('endereco', modelo.endereco)} style={{ fontSize: 12, marginTop: 6 }}>
                  ↺ Usar o endereço do hospital
                </button>
              )}
            </div>
            <div>
              <span className="field-label">Tipos sanguíneos necessários</span>
              <div role="group" aria-label="Tipos sanguíneos necessários" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {TIPOS_SANGUINEOS.map((t) => {
                  const sel = form.tipos.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => alternarTipo(t)}
                      style={{
                        padding: '9px 0', borderRadius: 10, fontSize: 14, fontWeight: 800, fontFamily: 'Fraunces, serif',
                        border: `1.5px solid ${sel ? 'var(--red)' : 'var(--border)'}`,
                        background: sel ? 'var(--red-light)' : 'var(--card)',
                        color: sel ? 'var(--red)' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.12s',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 8 }}>
                {modelo.tipos_necessarios.length > 0
                  ? `Pré-selecionados os tipos em falta no seu estoque (${modelo.tipos_necessarios.join(', ')}).`
                  : 'Nenhum tipo em falta no estoque agora: sem seleção, a campanha aceita todos os tipos.'}
              </p>
            </div>
          </div>

          {/* Prévia */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Prévia para os doadores
              </p>
              <div style={{ pointerEvents: 'none' }}>
                <CampanhaCard campanha={previa} layout="grid" onAbrir={() => undefined} />
              </div>
            </div>
            {erroEnvio && <div className="alert-error" role="alert">⚠️ {erroEnvio}</div>}
            <button
              className="btn-primary"
              type="submit"
              disabled={enviando}
              style={{ width: '100%', padding: '16px 0', fontSize: 16, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {enviando ? (<><div className="spinner" />Publicando...</>) : 'Publicar campanha'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
