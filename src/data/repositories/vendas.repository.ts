import { v4 as uuid } from 'uuid';
import { db } from '../local-database';
import { now } from '../../shared/utils/datetime';
import type { Entrada, Venda } from '../../core/entities';

interface RegistrarVendaInput {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  data: string;
  hora: string;
  observacao?: string;
}

// Regra de negócio: registrar uma venda sempre deve, de forma atômica:
// 1) validar que há estoque suficiente;
// 2) dar baixa no estoque;
// 3) gerar a Entrada financeira correspondente;
// 4) calcular o lucro (preço de venda − custo médio no momento da venda).
export async function registrarVenda(input: RegistrarVendaInput) {
  return db.transaction('rw', db.produtos, db.vendas, db.entradas, db.movimentacoes, async () => {
    const produto = await db.produtos.get(input.produtoId);
    if (!produto) throw new Error('Produto não encontrado');
    if (produto.quantidade < input.quantidade) {
      throw new Error(`Estoque insuficiente. Disponível: ${produto.quantidade} ${produto.unidade}`);
    }

    const total = input.quantidade * input.precoUnitario;
    const custoUnitario = produto.precoCompra;
    const lucro = total - (custoUnitario * input.quantidade);

    const entrada: Entrada = {
      id: uuid(), valor: total, data: input.data, hora: input.hora,
      categoria: produto.categoria || 'Outros',
      observacao: `Venda: ${produto.nome} (${input.quantidade} ${produto.unidade})${input.observacao ? ' — ' + input.observacao : ''}`,
      origem: 'venda', createdAt: now()
    };
    await db.entradas.add(entrada);

    const venda: Venda = {
      id: uuid(), produtoId: input.produtoId, quantidade: input.quantidade,
      precoUnitario: input.precoUnitario, custoUnitario, total, lucro,
      data: input.data, hora: input.hora, observacao: input.observacao,
      entradaId: entrada.id, createdAt: now()
    };
    await db.vendas.add(venda);
    await db.entradas.update(entrada.id, { vendaId: venda.id });

    await db.produtos.update(input.produtoId, {
      quantidade: produto.quantidade - input.quantidade,
      ultimaMovimentacao: now()
    });

    await db.movimentacoes.add({
      id: uuid(), produtoId: input.produtoId, tipo: 'saida', quantidade: input.quantidade,
      motivo: 'Venda', observacao: input.observacao, data: input.data, hora: input.hora, createdAt: now()
    });

    return venda;
  });
}

// Excluir uma venda devolve a quantidade ao estoque e remove a entrada financeira vinculada.
export async function deleteVenda(id: string) {
  return db.transaction('rw', db.vendas, db.entradas, db.produtos, db.movimentacoes, async () => {
    const venda = await db.vendas.get(id);
    if (!venda) return;
    const produto = await db.produtos.get(venda.produtoId);
    if (produto) {
      await db.produtos.update(venda.produtoId, {
        quantidade: produto.quantidade + venda.quantidade
      });
    }
    await db.entradas.delete(venda.entradaId);
    await db.vendas.delete(id);
  });
}
