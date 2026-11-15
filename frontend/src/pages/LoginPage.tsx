// Login do representante do hospital (necessário para o UC02 e o UC04).

import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { navegar } from '../router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }
    setCarregando(true);
    setErro('');
    try {
      await api.login(email.trim(), senha);
      navegar('/painel');
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', background: 'linear-gradient(160deg,#FAF7F4,#F7EDE8)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#D94F3D,#F0856A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(217,79,61,0.25)' }}>
            🩸
          </div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Acesso do Hospital</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Entre com suas credenciais para gerenciar o perfil</p>
        </div>

        <div className="card" style={{ padding: '32px 28px' }}>
          <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
            <div>
              <label className="field-label" htmlFor="email">E-mail institucional</label>
              <input
                id="email"
                className="input-field"
                type="email"
                placeholder="hemocentro@hospital.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="senha">Senha</label>
              <input
                id="senha"
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {erro && <div className="alert-error" role="alert">⚠️ {erro}</div>}
            <button
              className="btn-primary"
              type="submit"
              disabled={carregando}
              style={{ padding: '14px 0', fontSize: 15, borderRadius: 12, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {carregando ? (
                <>
                  <div className="spinner" />
                  Entrando...
                </>
              ) : 'Entrar no painel'}
            </button>
          </form>
          <div style={{ marginTop: 18, padding: '12px 14px', background: 'var(--muted)', borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0, textAlign: 'center' }}>
              Acesso exclusivo para representantes de hemocentros cadastrados
            </p>
          </div>
        </div>

        <button className="btn-link" onClick={() => navegar('/')} style={{ display: 'block', margin: '20px auto 0' }}>
          ← Voltar ao site
        </button>
      </div>
    </div>
  );
}
