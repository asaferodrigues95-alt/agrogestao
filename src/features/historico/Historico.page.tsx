import { db, ensureSettings, deleteEntrada, deleteSaida, deleteCompra, deleteVenda, ajustarEstoque } from '@data/repositories';
import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import PageHeader from '@shared/layout/PageHeader';
import Card from '@shared/ui/Card';
import { Badge, EmptyState, SearchInput, ConfirmDialog } from '@shared/ui/Misc';
import { Trash, Edit } from '@shared/ui/icons';
import { formatMoeda, formatDataHora } from '@shared/utils/format';
import LancamentoModal from '@features/financeiro/components/LancamentoModal';
import type { Entrada, Saida } from '@core/entities';

type FiltroTipo = 'todos' | 'Entrada' | 'Saída' | 'Compra' | 'Venda' | 'Estoque';

interface Item {
  id: string; tipo: 'Entrada' | 'Saída' | 'Compra' | 'Venda' | 'Estoque';
  data: string; hora: string; descricao: string; valor: number | null;
  cor: 'entrada' | 'saida' | 'info' | 'neutro'; createdAt: number;
  editavel?: Entrada | Saida; excluivel?: () => Promise<void>;
}

export default function Historico() {
  const [filtro, setFiltro] = useState<FiltroTipo>('todos');
  const [busca, setBusca] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [editando, setEditando] = useState<{ item: Entrada | Saida; tipo: 'entrada' | 'saida' } | null>(null);
  const [excluindo, setExcluindo] = useState<{ label: string; acao: () => Promise<void> } | null>(null);

  const entradas = useLiveQuery(() => db.entradas.toArray(), []) ?? [];
  const saidas = useLiveQuery(() => db.saidas.toArray(), []) ?? [];
  const compras = useLiveQuery(() => db.compras.toArray(), []) ?? [];
  const vendas = useLiveQuery(() => db.vendas.toArray(), []) ?? [];
  const movimentacoes = useLiveQuery(() => db.movimentacoes.toArray(), []) ?? [];
  const produtos = useLiveQuery(() => db.produtos.toArray(), []) ?? [];
  const settings = useLiveQuery(() => ensureSettings(), []);

  const nomeProduto = (id: string) => produtos.find(p => p.id === id)?.nome ?? 'Produto removido';

  const itens: Item[] = useMemo(() => {
    const lista: Item[] = [
      ...entradas.filter(e => e.origem === 'manual').map(e => ({
        id: e.id, tipo: 'Entrada' as const, data: e.data, hora: e.hora,
        descricao: e.observacao || e.categoria, valor: e.valor, cor: 'entrada' as const, createdAt: e.createdAt,
        editavel: e, excluivel: () => deleteEntrada(e.id)
      })),
      ...saidas.filter(s => s.origem === 'manual').map(s => ({
        id: s.id, tipo: 'Saída' as const, data: s.data, hora: s.hora,
        descricao: s.observacao || s.categoria, valor: s.valor, cor: 'saida' as const, createdAt: s.createdAt,
        editavel: s, excluivel: () => deleteSaida(s.id)
      })),
      ...compras.map(c => ({
        id: c.id, tipo: 'Compra' as const, data: c.data, hora: c.hora,
        descricao: `${nomeProduto(c.produtoId)} — ${c.quantidade} un.`, valor: c.total, cor: 'saida' as const, createdAt: c.createdAt,
        excluivel: () => deleteCompra(c.id)
      })),
      ...vendas.map(v => ({
        id: v.id, tipo: 'Venda' as const, data: v.data, hora: v.hora,
        descricao: `${nomeProduto(v.produtoId)} — ${v.quantidade} un. (lucro ${formatMoeda(v.lucro)})`, valor: v.total, cor: 'entrada' as const, createdAt: v.createdAt,
        excluivel: () => deleteVenda(v.id)
      })),
      ...movimentacoes.filter(m => m.motivo === 'Ajuste manual').map(m => ({
        id: m.id, tipo: 'Estoque' as const, data: m.data, hora: m.hora,
        descricao: `${nomeProduto(m.produtoId)} — ${m.tipo === 'entrada' ? '+' : '-'}${m.quantidade} (${m.motivo})`,
        valor: null, cor: 'neutro' as const, createdAt: m.createdAt,
        excluivel: async () => {
          await ajustarEstoque(m.produtoId, m.quantidade, m.tipo === 'entrada' ? 'saida' : 'entrada', 'Estorno de ajuste');
          await db.movimentacoes.delete(m.id);
        }
      }))
    ];
    return lista
      .filter(i => filtro === 'todos' || i.tipo === filtro)
      .filter(i => !busca || i.descricao.toLowerCase().includes(busca.toLowerCase()))
      .filter(i => !inicio || i.data >= inicio)
      .filter(i => !fim || i.data <= fim)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [entradas, saidas, compras, vendas, movimentacoes, produtos, filtro, busca, inicio, fim]);

  const tipos: FiltroTipo[] = ['todos', 'Entrada', 'Saída', 'Compra', 'Venda', 'Estoque'];

  return (
    <div>
      <PageHeader title="Histórico" subtitle={`${itens.length} registros encontrados`} />

      <div className="px-4 md:px-8 space-y-4">
        <SearchInput value={busca} onChange={setBusca} placeholder="Pesquisar no histórico" />

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {tipos.map(t => (
            <button key={t} onClick={() => setFiltro(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${filtro === t ? 'bg-feira-primary text-white border-feira-primary' : 'border-feira-borda dark:border-feira-bordaDark text-neutral-500'}`}>
              {t === 'todos' ? 'Todos' : t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-neutral-500 flex flex-col gap-1">De
            <input type="date" value={inicio} onChange={e => setInicio(e.target.value)}
              className="rounded-xl border border-feira-borda dark:border-feira-bordaDark bg-white dark:bg-feira-bgDark px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-neutral-500 flex flex-col gap-1">Até
            <input type="date" value={fim} onChange={e => setFim(e.target.value)}
              className="rounded-xl border border-feira-borda dark:border-feira-bordaDark bg-white dark:bg-feira-bgDark px-3 py-2 text-sm" />
          </label>
        </div>

        <Card className="divide-y divide-feira-borda dark:divide-feira-bordaDark">
          {itens.length === 0 && <EmptyState title="Nenhum registro encontrado" message="Ajuste os filtros ou registre um novo lançamento." />}
          {itens.map(item => (
            <div key={`${item.tipo}-${item.id}`} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge color={item.cor === 'neutro' ? 'neutro' : item.cor}>{item.tipo}</Badge>
                </div>
                <p className="text-sm font-medium truncate mt-1">{item.descricao}</p>
                <p className="text-xs text-neutral-400">{formatDataHora(item.data, item.hora)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.valor !== null && (
                  <span className={`font-semibold text-sm ${item.cor === 'entrada' ? 'text-feira-entrada' : item.cor === 'saida' ? 'text-feira-saida' : ''}`}>
                    {formatMoeda(item.valor)}
                  </span>
                )}
                {item.editavel && (
                  <button onClick={() => setEditando({ item: item.editavel!, tipo: item.tipo === 'Entrada' ? 'entrada' : 'saida' })}
                    aria-label={`Editar ${item.descricao}`}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400">
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {item.excluivel && (
                  <button onClick={() => setExcluindo({ label: item.descricao, acao: item.excluivel! })}
                    aria-label={`Excluir ${item.descricao}`}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-feira-saida">
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {editando && (
        <LancamentoModal open={!!editando} onClose={() => setEditando(null)} tipo={editando.tipo}
          categorias={editando.tipo === 'entrada' ? settings?.categoriasEntrada ?? [editando.item.categoria] : settings?.categoriasSaida ?? [editando.item.categoria]}
          editando={editando.item} />
      )}
      <ConfirmDialog open={!!excluindo} title="Excluir registro"
        message={`Excluir "${excluindo?.label}"? Isso reverte o estoque e os lançamentos financeiros relacionados, quando aplicável.`}
        onCancel={() => setExcluindo(null)}
        onConfirm={async () => { await excluindo?.acao(); setExcluindo(null); }} />
    </div>
  );
}
