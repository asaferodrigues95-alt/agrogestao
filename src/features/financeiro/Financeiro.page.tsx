import { db, ensureSettings, deleteEntrada, deleteSaida } from '@data/repositories';
import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import PageHeader from '@shared/layout/PageHeader';
import Card from '@shared/ui/Card';
import Button from '@shared/ui/Button';
import { Badge, ConfirmDialog, EmptyState, SearchInput } from '@shared/ui/Misc';
import { Plus, ArrowUp, ArrowDown, Edit, Trash, Wallet } from '@shared/ui/icons';
import { formatMoeda, formatDataHora } from '@shared/utils/format';
import { somaValores } from '@core/calculations/business-calculations';
import LancamentoModal from './components/LancamentoModal';
import type { Entrada, Saida } from '@core/entities';

export default function Financeiro() {
  const [tab, setTab] = useState<'entrada' | 'saida'>('entrada');
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Entrada | Saida | null>(null);
  const [excluindo, setExcluindo] = useState<{ id: string; tipo: 'entrada' | 'saida' } | null>(null);

  const settings = useLiveQuery(() => ensureSettings(), []);
  const entradas = useLiveQuery(() => db.entradas.orderBy('createdAt').reverse().toArray(), []) ?? [];
  const saidas = useLiveQuery(() => db.saidas.orderBy('createdAt').reverse().toArray(), []) ?? [];

  const categorias = tab === 'entrada' ? settings?.categoriasEntrada ?? [] : settings?.categoriasSaida ?? [];
  const lista = tab === 'entrada' ? entradas : saidas;

  const listaFiltrada = useMemo(() => {
    return lista.filter(item => {
      const buscaOk = !busca || item.categoria.toLowerCase().includes(busca.toLowerCase()) || (item.observacao ?? '').toLowerCase().includes(busca.toLowerCase());
      const catOk = categoriaFiltro === 'todas' || item.categoria === categoriaFiltro;
      return buscaOk && catOk;
    });
  }, [lista, busca, categoriaFiltro]);

  const total = somaValores(listaFiltrada);

  const abrirNovo = () => { setEditando(null); setModalAberto(true); };
  const abrirEdicao = (item: Entrada | Saida) => { setEditando(item); setModalAberto(true); };

  const confirmarExclusao = async () => {
    if (!excluindo) return;
    if (excluindo.tipo === 'entrada') await deleteEntrada(excluindo.id);
    else await deleteSaida(excluindo.id);
    setExcluindo(null);
  };

  return (
    <div>
      <PageHeader title="Financeiro" subtitle="Entradas e saídas de caixa"
        action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={abrirNovo}>Novo</Button>} />

      <div className="px-4 md:px-8 space-y-4">
        {/* Abas */}
        <div className="flex gap-2 bg-feira-surface dark:bg-feira-surfaceDark rounded-xl p-1 border border-feira-borda dark:border-feira-bordaDark w-fit">
          <button onClick={() => { setTab('entrada'); setCategoriaFiltro('todas'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'entrada' ? 'bg-feira-entrada text-white' : 'text-neutral-500'}`}>
            <ArrowUp className="w-4 h-4" /> Entradas
          </button>
          <button onClick={() => { setTab('saida'); setCategoriaFiltro('todas'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'saida' ? 'bg-feira-saida text-white' : 'text-neutral-500'}`}>
            <ArrowDown className="w-4 h-4" /> Saídas
          </button>
        </div>

        {/* Resumo do total filtrado */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Total {tab === 'entrada' ? 'de entradas' : 'de saídas'}</p>
            <p className={`font-display font-semibold text-2xl ${tab === 'entrada' ? 'text-feira-entrada' : 'text-feira-saida'}`}>{formatMoeda(total)}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tab === 'entrada' ? 'bg-feira-entrada/10 text-feira-entrada' : 'bg-feira-saida/10 text-feira-saida'}`}>
            <Wallet />
          </div>
        </Card>

        {/* Busca e filtro por categoria */}
        <div className="flex gap-2">
          <div className="flex-1"><SearchInput value={busca} onChange={setBusca} placeholder="Pesquisar por categoria ou observação" /></div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button onClick={() => setCategoriaFiltro('todas')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${categoriaFiltro === 'todas' ? 'bg-feira-primary text-white border-feira-primary' : 'border-feira-borda dark:border-feira-bordaDark text-neutral-500'}`}>
            Todas
          </button>
          {categorias.map(c => (
            <button key={c} onClick={() => setCategoriaFiltro(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${categoriaFiltro === c ? 'bg-feira-primary text-white border-feira-primary' : 'border-feira-borda dark:border-feira-bordaDark text-neutral-500'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Lista */}
        <Card className="divide-y divide-feira-borda dark:divide-feira-bordaDark pb-1">
          {listaFiltrada.length === 0 && (
            <EmptyState title={`Nenhuma ${tab === 'entrada' ? 'entrada' : 'saída'} encontrada`} message="Toque em “Novo” para registrar o primeiro lançamento." />
          )}
          {listaFiltrada.map(item => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{item.categoria}</p>
                  {item.origem !== 'manual' && <Badge color="info">{item.origem === 'venda' ? 'venda' : 'compra'}</Badge>}
                </div>
                {item.observacao && <p className="text-xs text-neutral-400 truncate">{item.observacao}</p>}
                <p className="text-xs text-neutral-400">{formatDataHora(item.data, item.hora)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`font-semibold text-sm ${tab === 'entrada' ? 'text-feira-entrada' : 'text-feira-saida'}`}>{formatMoeda(item.valor)}</span>
                {item.origem === 'manual' && (
                  <>
                    <button onClick={() => abrirEdicao(item)} aria-label={`Editar lançamento ${item.categoria}`} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setExcluindo({ id: item.id, tipo: tab })} aria-label={`Excluir lançamento ${item.categoria}`} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-feira-saida">
                      <Trash className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>

      <LancamentoModal open={modalAberto} onClose={() => setModalAberto(false)} tipo={tab} categorias={categorias} editando={editando} />
      <ConfirmDialog open={!!excluindo} title="Excluir lançamento"
        message="Tem certeza que deseja excluir este lançamento? Essa ação não pode ser desfeita."
        onCancel={() => setExcluindo(null)} onConfirm={confirmarExclusao} />
    </div>
  );
}
