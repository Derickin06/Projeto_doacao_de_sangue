// Datas da API chegam como "AAAA-MM-DD". Montamos a data local sem fuso para não
// "voltar um dia" ao converter (new Date("2026-11-15") seria meia-noite UTC).

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function parseData(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function hojeISO(): string {
  const h = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${h.getFullYear()}-${p(h.getMonth() + 1)}-${p(h.getDate())}`;
}

/** "15 nov" */
export function dataCurta(iso: string): string {
  const d = parseData(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

/** "15/11/2026" */
export function dataCompleta(iso: string): string {
  return parseData(iso).toLocaleDateString('pt-BR');
}

/** "15 nov – 29 nov" ou "15 nov" quando começa e termina no mesmo dia */
export function periodo(inicio: string, fim: string): string {
  return inicio === fim ? dataCurta(inicio) : `${dataCurta(inicio)} – ${dataCurta(fim)}`;
}

/** Situação da campanha em relação a hoje. */
export function situacaoCampanha(inicio: string, fim: string): { texto: string; acontecendo: boolean; encerrada: boolean } {
  const hoje = hojeISO();
  if (fim < hoje) return { texto: 'Encerrada', acontecendo: false, encerrada: true };
  if (inicio <= hoje) {
    return { texto: fim === hoje ? 'Último dia hoje' : `Acontecendo até ${dataCurta(fim)}`, acontecendo: true, encerrada: false };
  }
  return { texto: `Começa em ${dataCurta(inicio)}`, acontecendo: false, encerrada: false };
}
