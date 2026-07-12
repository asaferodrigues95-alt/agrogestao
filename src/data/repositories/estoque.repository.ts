import { v4 as uuid } from 'uuid';
import { db } from '../local-database';
import { now, todayStr, nowTimeStr } from '../../shared/utils/datetime';
import type { MovimentacaoEstoque, TipoMovimentacao } from '../../core/entities';

// Ajuste manual de estoque (perdas, quebras, correção de contagem).
// Não gera nenhum lançamento financeiro — para isso existem os repositórios de compras/vendas.
export async function ajustarEstoque(
  produtoId: string,
  quantidade: number,
  tipo: TipoMovimentacao,
  motivo: string,
  observacao?: string
) {
  return db.transaction('rw', db.produtos, db.movimentacoes, async () => {
    const produto = await db.produtos.get(produtoId);
    if (!produto) throw new Error('Produto não encontrado');

    const delta = tipo === 'saida' ? -Math.abs(quantidade) : Math.abs(quantidade);
    const novaQuantidade = Math.max(0, produto.quantidade + delta);
    await db.produtos.update(produtoId, { quantidade: novaQuantidade, ultimaMovimentacao: now() });

    const movimentacao: MovimentacaoEstoque = {
      id: uuid(), produtoId, tipo, quantidade: Math.abs(quantidade), motivo, observacao,
      data: todayStr(), hora: nowTimeStr(), createdAt: now()
    };
    await db.movimentacoes.add(movimentacao);
    return movimentacao;
  });
}
