// Mensagens de carregando / erro / vazio, no estilo do protótipo.

interface CarregandoProps {
  texto?: string;
}

export function Carregando({ texto = 'Carregando...' }: CarregandoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '60px 24px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 14 }}>
      <div className="spinner spinner-dark" />
      {texto}
    </div>
  );
}

interface ErroProps {
  mensagem: string;
  onTentarDeNovo?: () => void;
}

export function Erro({ mensagem, onTentarDeNovo }: ErroProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <p style={{ fontSize: 36, marginBottom: 10 }}>⚠️</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Algo deu errado</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>{mensagem}</p>
      {onTentarDeNovo && (
        <button className="btn-secondary" onClick={onTentarDeNovo} style={{ padding: '9px 20px', fontSize: 13 }}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

interface VazioProps {
  icone?: string;
  titulo: string;
  texto?: string;
}

export function Vazio({ icone = '🔍', titulo, texto }: VazioProps) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>{icone}</p>
      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{titulo}</p>
      {texto && <p style={{ fontSize: 13 }}>{texto}</p>}
    </div>
  );
}
