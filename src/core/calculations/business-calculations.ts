import type { Entrada, Saida, Produto, Venda, Compra } from '../entities';

export const isHoje = (data: string) => data === new Date().toISOString().slice(0, 10);
export const isMesAtual = (data: string) => data.slice(0, 7) === new Date().toISOString().slice(0, 7);
export const isAnoAtual = (data: string) => data.slice(0, 4) === new Date().toISOString().slice(0, 4);

export function somaValores<T extends { valor: number }>(itens: T[]): number {
  return itens.reduce((acc, i) => acc + i.valor, 0);
}

export function calcularCaixa(entradas: Entrada[], saidas: Saida[], caixaInicial: number): number {
  return caixaInicial + somaValores(entradas) - somaValores(saidas);
}

export function valorTotalEstoque(produtos: Produto[]): number {
  return produtos.reduce((acc, p) => acc + p.quantidade * p.precoCompra, 0);
}

export function quantidadeTotalEstoque(produtos: Produto[]): number {
  return produtos.reduce((acc, p) => acc + p.quantidade, 0);
}

export function produtosEstoqueBaixo(produtos: Produto[]): Produto[] {
  return produtos.filter(p => p.quantidade <= p.quantidadeMinima);
}

export function produtosSemMovimentacao(produtos: Produto[], diasLimite = 15): Produto[] {
  const limite = Date.now() - diasLimite * 24 * 60 * 60 * 1000;
  return produtos.filter(p => (p.ultimaMovimentacao ?? p.createdAt) < limite);
}

// Agrupa entradas/saídas por mês (YYYY-MM) para gráficos de evolução anual.
export function agruparPorMes(itens: { data: string; valor: number }[]): Record<string, number> {
  const mapa: Record<string, number> = {};
  for (const item of itens) {
    const chave = item.data.slice(0, 7);
    mapa[chave] = (mapa[chave] ?? 0) + item.valor;
  }
  return mapa;
}

export function ultimos12Meses(): string[] {
  const meses: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    meses.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
  }
  return meses;
}

export interface RankingProduto {
  produtoId: string;
  nome: string;
  quantidadeVendida: number;
  faturamento: number;
  lucro: number;
  margem: number; // % média de margem
}

export function rankingProdutos(vendas: Venda[], produtos: Produto[]): RankingProduto[] {
  const mapa: Record<string, RankingProduto> = {};
  for (const v of vendas) {
    const produto = produtos.find(p => p.id === v.produtoId);
    const nome = produto?.nome ?? 'Produto removido';
    if (!mapa[v.produtoId]) {
      mapa[v.produtoId] = { produtoId: v.produtoId, nome, quantidadeVendida: 0, faturamento: 0, lucro: 0, margem: 0 };
    }
    mapa[v.produtoId].quantidadeVendida += v.quantidade;
    mapa[v.produtoId].faturamento += v.total;
    mapa[v.produtoId].lucro += v.lucro;
  }
  return Object.values(mapa).map(r => ({
    ...r,
    margem: r.faturamento > 0 ? Number(((r.lucro / r.faturamento) * 100).toFixed(1)) : 0
  }));
}

export function filtrarPeriodo<T extends { data: string }>(itens: T[], inicio?: string, fim?: string): T[] {
  return itens.filter(i => (!inicio || i.data >= inicio) && (!fim || i.data <= fim));
}

export function comparativoComprasVendas(compras: Compra[], vendas: Venda[]) {
  const meses = ultimos12Meses();
  return meses.map(mes => ({
    mes,
    compras: compras.filter(c => c.data.slice(0, 7) === mes).reduce((a, c) => a + c.total, 0),
    vendas: vendas.filter(v => v.data.slice(0, 7) === mes).reduce((a, v) => a + v.total, 0)
  }));
}
