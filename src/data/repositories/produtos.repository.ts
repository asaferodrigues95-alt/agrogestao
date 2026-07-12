import { v4 as uuid } from 'uuid';
import { db } from '../local-database';
import { now } from '../../shared/utils/datetime';
import type { Produto } from '../../core/entities';

export async function addProduto(input: Omit<Produto, 'id' | 'createdAt' | 'ultimaMovimentacao'>) {
  const produto: Produto = { ...input, id: uuid(), createdAt: now(), ultimaMovimentacao: now() };
  await db.produtos.add(produto);
  return produto;
}

export const updateProduto = (id: string, changes: Partial<Produto>) => db.produtos.update(id, changes);

// Ao excluir um produto, também removemos seu histórico de movimentações de estoque
// (mas o histórico financeiro de compras/vendas passadas é preservado propositalmente).
export async function deleteProduto(id: string) {
  await db.transaction('rw', db.produtos, db.movimentacoes, db.compras, db.vendas, async () => {
    await db.produtos.delete(id);
    await db.movimentacoes.where('produtoId').equals(id).delete();
  });
}
