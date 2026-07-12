export function formatMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDataBR(dataISO: string): string {
  const [y, m, d] = dataISO.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDataHora(dataISO: string, hora: string): string {
  return `${formatDataBR(dataISO)} às ${hora}`;
}

export function nomeMes(mesIndex: number): string {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return meses[mesIndex];
}

export function diasDesde(timestamp?: number): number {
  if (!timestamp) return Infinity;
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}
