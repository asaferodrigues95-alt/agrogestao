import { v4 as uuid } from 'uuid';
import { db } from '../local-database';
import { now } from '../../shared/utils/datetime';
import type { Saida, Compra } from '../../core/entities';

interface RegistrarCompraInput {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  fornecedorId?: string;
  data: string;
  hora: string;
  observacao?: string;
}

// Regra de negócio: registrar uma compra sempre deve, de forma atômica:
// 1) gerar a Saída financeira correspondente;
// 2) aumentar o estoque do produto;
// 3) recalcular o custo médio ponderado do produto.
export async function registrarCompra(input: RegistrarCompraInput) {
  return db.transaction('rw', db.produtos, db.compras, db.saidas, db.movimentacoes, async () => {
    const produto = await db.produtos.get(input.produtoId);
    if (!produto) throw new Error('Produto não encontrado');

    const total = input.quantidade * input.precoUnitario;

    // Custo médio ponderado: (estoqueAtual * custoAtual + novaQtd * novoPreço) / (estoqueAtual + novaQtd)
    const qtdAtual = produto.quantidade;
    const custoAtual = produto.precoCompra;
    const novaQtdTotal = qtdAtual + input.quantidade;
    const novoCustoMedio = novaQtdTotal > 0
      ? ((qtdAtual * custoAtual) + (input.quantidade * input.precoUnitario)) / novaQtdTotal
      : input.precoUnitario;

    const saida: Saida = {
      id: uuid(), valor: total, data: input.data, hora: input.hora,
      categoria: 'Compra de mercadorias',
      observacao: `Compra: ${produto.nome} (${input.quantidade} ${produto.unidade})${input.observacao ? ' — ' + input.observacao : ''}`,
      origem: 'compra', createdAt: now()
    };
    await db.saidas.add(saida);

    const compra: Compra = {
      id: uuid(), produtoId: input.produtoId, quantidade: input.quantidade,
      precoUnitario: input.precoUnitario, total, fornecedorId: input.fornecedorId,
      data: input.data, hora: input.hora, observacao: input.observacao,
      saidaId: saida.id, createdAt: now()
    };
    await db.compras.add(compra);
    await db.saidas.update(saida.id, { compraId: compra.id });

    await db.produtos.update(input.produtoId, {
      quantidade: novaQtdTotal,
      precoCompra: Number(novoCustoMedio.toFixed(2)),
      ultimaMovimentacao: now(),
      ...(input.fornecedorId ? { fornecedorId: input.fornecedorId } : {})
    });

    await db.movimentacoes.add({
      id: uuid(), produtoId: input.produtoId, tipo: 'entrada', quantidade: input.quantidade,
      motivo: 'Compra', observacao: input.observacao, data: input.data, hora: input.hora, createdAt: now()
    });

    return compra;
  });
}

// Excluir uma compra reverte o estoque adicionado e remove a saída financeira vinculada.
// Observação (documentada na auditoria): o custo médio ponderado NÃO é recalculado
// retroativamente ao excluir — ver ARCHITECTURE.md, seção "Sugestões para a Fase 1".
export async function deleteCompra(id: string) {
  return db.transaction('rw', db.compras, db.saidas, db.produtos, db.movimentacoes, async () => {
    const compra = await db.compras.get(id);
    if (!compra) return;
    const produto = await db.produtos.get(compra.produtoId);
    if (produto) {
      await db.produtos.update(compra.produtoId, {
        quantidade: Math.max(0, produto.quantidade - compra.quantidade)
      });
    }
    await db.saidas.delete(compra.saidaId);
    await db.compras.delete(id);
  });
}
