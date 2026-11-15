// UC02 — Atualizar informações do hospital (dados, horários, avisos e estoque).

import { useEffect, useState, type ReactNode } from 'react';
import { api } from '../api';
import { Carregando, Erro } from '../components/Estado';
import { STATUS, statusDoEstoque, type Status } from '../estoque';
import { TIPOS_SANGUINEOS, type Hospital } from '../types';
import { useApi } from '../useApi';

interface Dados {
  nome: string;
  endereco: string;
  telefone: string;
  horario_funcionamento: string;
  observacoes: string;
}

type Estoque = Record<string, { quantidade: number; quantidade_minima: number }>;

function dadosDe(h: Hospital): Dados {
  return {
    nome: h.nome,
    endereco: h.endereco,
    telefone: h.telefone ?? '',
    horario_funcionamento: h.horario_funcionamento ?? '',
    observacoes: h.observacoes ?? '',
  };
}

function estoqueDe(h: Hospital): Estoque {
  const e: Estoque = {};
  for (const t of TIPOS_SANGUINEOS) e[t] = { quantidade: 0, quantidade_minima: 0 };
  for (const item of h.estoque) e[item.tipo_sanguineo] = { quantidade: item.quantidade, quantidade_minima: item.quantidade_minima };
  return e;
}

function Campo({ rotulo, htmlFor, children }: { rotulo: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label className="field-label" htmlFor={htmlFor} style={{ fontSize: 11, letterSpacing: '0.06em' }}>{rotulo}</label>
      {children}
    </div>
  );
}

export default function PainelPage() {
  const { dados: hospital, erro, carregando, recarregar } = useApi(() => api.meuHospital());
  const [dados, setDados] = useState<Dados | null>(null);
  const [estoque, setEstoque] = useState<Estoque>({});
  const [tiposEditados, setTiposEditados] = useState<Set<string>>(new Set());
  const [alterado, setAlterado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erroSalvar, setErroSalvar] = useState('');

  // Preenche o formulário quando os dados do hospital chegam
  useEffect(() => {
    if (!hospital) return;
    setDados(dadosDe(hospital));
    setEstoque(estoqueDe(hospital));
    setTiposEditados(new Set());
    setAlterado(false);
  }, [hospital]);

  // Avisa antes de fechar a aba com alterações não salvas
  useEffect(() => {
    if (!alterado) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [alterado]);

  if (carregando && !hospital) return <div style={{ paddingTop: 84 }}><Carregando texto="Carregando painel..." /></div>;
  if (erro || !hospital || !dados) {
    return <div style={{ paddingTop: 84 }}><Erro mensagem={erro ?? 'Não foi possível carregar o hospital.'} onTentarDeNovo={recarregar} /></div>;
  }

  const marcarAlterado = () => { setSalvo(false); setAlterado(true); setErroSalvar(''); };

  const mudarCampo = (campo: keyof Dados, valor: string) => {
    setDados((d) => (d ? { ...d, [campo]: valor } : d));
    marcarAlterado();
  };

  const mudarEstoque = (tipo: string, campo: 'quantidade' | 'quantidade_minima', valor: string) => {
    const n = Math.max(0, Math.floor(Number(valor) || 0));
    setEstoque((e) => ({ ...e, [tipo]: { ...e[tipo], [campo]: n } }));
    setTiposEditados((s) => new Set(s).add(tipo));
    marcarAlterado();
  };

  const salvar = async () => {
    if (!dados.nome.trim() || !dados.endereco.trim()) {
      setErroSalvar('Nome e endereço são obrigatórios.');
      return;
    }
    setSalvando(true);
    setErroSalvar('');
    try {
      const vazioParaNull = (v: string) => (v.trim() ? v.trim() : null);
      await api.atualizarHospital({
        nome: dados.nome.trim(),
        endereco: dados.endereco.trim(),
        telefone: vazioParaNull(dados.telefone),
        horario_funcionamento: vazioParaNull(dados.horario_funcionamento),
        observacoes: vazioParaNull(dados.observacoes),
      });
      // Envia só os tipos que já existiam no banco ou que foram editados agora
      const existentes = new Set(hospital.estoque.map((e) => e.tipo_sanguineo));
      const itens = TIPOS_SANGUINEOS.filter((t) => existentes.has(t) || tiposEditados.has(t)).map((t) => ({
        tipo_sanguineo: t,
        ...estoque[t],
      }));
      if (itens.length > 0) await api.atualizarEstoque(itens);
      setSalvo(true);
      recarregar(); // busca de novo para mostrar exatamente o que ficou salvo
    } catch (e) {
      setErroSalvar((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  const emFalta = TIPOS_SANGUINEOS.filter((t) => ['critical', 'high'].includes(statusDoEstoque(estoque[t].quantidade, estoque[t].quantidade_minima)));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '84px 24px 60px' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Painel de gestão</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{hospital.nome}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {alterado && (
            <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 700, background: '#FFF3ED', padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(232,160,69,0.25)' }}>
              Alterações não salvas
            </span>
          )}
          <button
            className="btn-primary"
            onClick={salvar}
            disabled={salvando || !alterado}
            style={{
              padding: '11px 24px', fontSize: 14,
              opacity: alterado || salvando || salvo ? 1 : 0.5,
              background: salvo && !alterado ? 'var(--sage)' : undefined,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {salvando ? (
              <>
                <div className="spinner" style={{ width: 14, height: 14 }} />
                Salvando...
              </>
            ) : salvo && !alterado ? '✓ Salvo com sucesso' : 'Salvar alterações'}
          </button>
        </div>
      </div>

      {erroSalvar && <div className="alert-error" role="alert" style={{ marginBottom: 20 }}>⚠️ {erroSalvar}</div>}

      <div className="grid-2">
        {/* Dados cadastrais */}
        <div className="card" style={{ padding: '26px 28px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Dados cadastrais</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Campo rotulo="Nome do hemocentro" htmlFor="nome">
              <input id="nome" className="input-field" value={dados.nome} onChange={(e) => mudarCampo('nome', e.target.value)} />
            </Campo>
            <Campo rotulo="Endereço" htmlFor="endereco">
              <input id="endereco" className="input-field" value={dados.endereco} onChange={(e) => mudarCampo('endereco', e.target.value)} />
            </Campo>
            <Campo rotulo="Telefone" htmlFor="telefone">
              <input id="telefone" className="input-field" type="tel" placeholder="(11) 0000-0000" value={dados.telefone} onChange={(e) => mudarCampo('telefone', e.target.value)} />
            </Campo>
            <Campo rotulo="Horário de funcionamento" htmlFor="horario">
              <input id="horario" className="input-field" placeholder="Ex.: Seg a Sex 07h–17h; Sáb 07h–12h" value={dados.horario_funcionamento} onChange={(e) => mudarCampo('horario_funcionamento', e.target.value)} />
            </Campo>
          </div>
        </div>

        {/* Dias sem atendimento / avisos */}
        <div className="card" style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Dias sem atendimento e avisos</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 18 }}>
            Exceções de funcionamento que os doadores devem saber antes de ir.
          </p>
          <textarea
            id="observacoes"
            aria-label="Dias sem atendimento e avisos"
            className="input-field"
            placeholder={'Ex.:\nFechado em 15/11 e 25/12.\nNo dia 20/11 o atendimento vai até as 12h.'}
            value={dados.observacoes}
            onChange={(e) => mudarCampo('observacoes', e.target.value)}
            style={{ flex: 1, minHeight: 180 }}
          />
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--muted)', borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
              {emFalta.length > 0
                ? <>🔴 Em falta agora: <strong style={{ color: 'var(--red)' }}>{emFalta.join(', ')}</strong></>
                : '✅ Nenhum tipo sanguíneo abaixo do estoque mínimo.'}
            </p>
          </div>
        </div>

        {/* Estoque por tipo sanguíneo */}
        <div className="card span-all" style={{ padding: '26px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Controle de demanda por tipo sanguíneo</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(Object.keys(STATUS) as Status[]).map((s) => (
                <span key={s} style={{ fontSize: 11, fontWeight: 700, color: STATUS[s].cor, background: STATUS[s].fundo, padding: '3px 10px', borderRadius: 20 }}>{STATUS[s].rotulo}</span>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 20 }}>
            Informe as bolsas em estoque e o mínimo ideal: a necessidade é calculada automaticamente.
          </p>
          <div className="grid-4">
            {TIPOS_SANGUINEOS.map((t) => {
              const { quantidade, quantidade_minima } = estoque[t];
              const cfg = STATUS[statusDoEstoque(quantidade, quantidade_minima)];
              const falta = Math.max(0, quantidade_minima - quantidade);
              return (
                <div key={t} style={{ background: cfg.fundo, borderRadius: 14, padding: '16px 16px 14px', border: `1.5px solid ${cfg.cor}25`, transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 6 }}>
                    <span style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: cfg.cor }}>{t}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: cfg.cor, background: 'white', padding: '3px 8px', borderRadius: 20, textAlign: 'right' }}>{cfg.rotulo}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label htmlFor={`qtd-${t}`} style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Bolsas</label>
                      <input id={`qtd-${t}`} className="input-field" type="number" min={0} inputMode="numeric" value={quantidade}
                        onChange={(e) => mudarEstoque(t, 'quantidade', e.target.value)} style={{ background: 'white', fontSize: 13, padding: '7px 10px' }} />
                    </div>
                    <div>
                      <label htmlFor={`min-${t}`} style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Mínimo</label>
                      <input id={`min-${t}`} className="input-field" type="number" min={0} inputMode="numeric" value={quantidade_minima}
                        onChange={(e) => mudarEstoque(t, 'quantidade_minima', e.target.value)} style={{ background: 'white', fontSize: 13, padding: '7px 10px' }} />
                    </div>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: falta > 0 ? cfg.cor : 'var(--text-muted)', margin: '10px 0 0' }}>
                    {falta > 0 ? `Faltam ${falta} ${falta === 1 ? 'bolsa' : 'bolsas'}` : 'Estoque em dia'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmação */}
      {salvo && !alterado && (
        <div className="success-in" style={{ marginTop: 20, background: 'rgba(200,224,206,0.4)', border: '1px solid rgba(107,158,122,0.3)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <p style={{ fontWeight: 800, color: 'var(--sage)', fontSize: 14, margin: 0 }}>Alterações salvas com sucesso!</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>As informações já estão atualizadas para os doadores.</p>
          </div>
        </div>
      )}

    </div>
  );
}
