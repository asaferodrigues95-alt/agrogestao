import { db, deleteProduto } from '@data/repositories';
import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@shared/layout/PageHeader';
import Button from '@shared/ui/Button';
import Card from '@shared/ui/Card';
import { SearchInput, EmptyState, ConfirmDialog } from '@shared/ui/Misc';
import { Plus, ShoppingCart, Tag, Boxes } from '@shared/ui/icons';
import ProdutoModal from './components/ProdutoModal';
import CompraModal from './components/CompraModal';
import VendaModal from './components/VendaModal';
import AjusteEstoqueModal from './components/AjusteEstoqueModal';
import ProdutoCard from './components/ProdutoCard';
import { formatMoeda } from '@shared/utils/format';
import { valorTotalEstoque } from '@core/calculations/business-calculations';
import type { Produto } from '@core/entities';

export default function Estoque() {
  const produtos = useLiveQuery(() => db.produtos.orderBy('nome').toArray(), []) ?? [];
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [somenteBaixo, setSomenteBaixo] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [modalProduto, setModalProduto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [modalCompra, setModalCompra] = useState(false);
  const [modalVenda, setModalVenda] = useState(false);
  const [ajustando, setAjustando] = useState<Produto | null>(null);
  const [produtoAtivo, setProdutoAtivo] = useState<string | undefined>(undefined);
  const [excluindo, setExcluindo] = useState<Produto | null>(null);

  // Atalho de UX: um botão no Painel ("Vender"/"Comprar") pode levar direto para
  // cá já com o modal certo aberto (ex: /estoque?acao=vender), poupando o toque
  // extra de "entrar em Estoque → depois achar o botão". Ver PRODUCT.md, Etapa 3/4.
  useEffect(() => {
    const acao = searchParams.get('acao');
    if (acao === 'vender') setModalVenda(true);
    if (acao === 'comprar') setModalCompra(true);
    if (acao) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categorias = useMemo(() => Array.from(new Set(produtos.map(p => p.categoria))).sort(), [produtos]);

  const filtrados = useMemo(() => produtos.filter(p => {
    const buscaOk = !busca || p.nome.toLowerCase().includes(busca.toLowerCase());
    const catOk = categoriaFiltro === 'todas' || p.categoria === categoriaFiltro;
    const baixoOk = !somenteBaixo || p.quantidade <= p.quantidadeMinima;
    return buscaOk && catOk && baixoOk;
  }), [produtos, busca, categoriaFiltro, somenteBaixo]);

  const abrirNovoProduto = () => { setEditando(null); setModalProduto(true); };
  const abrirEdicao = (p: Produto) => { setEditando(p); setModalProduto(true); };
  const abrirCompra = (produtoId?: string) => { setProdutoAtivo(produtoId); setModalCompra(true); };
  const abrirVenda = (produtoId?: string) => { setProdutoAtivo(produtoId); setModalVenda(true); };

  const confirmarExclusao = async () => {
    if (!excluindo) return;
    await deleteProduto(excluindo.id);
    setExcluindo(null);
  };

  return (
    <div>
      <PageHeader title="Estoque" subtitle={`${produtos.length} produtos · ${formatMoeda(valorTotalEstoque(produtos))} em valor`}
        action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={abrirNovoProduto}>Produto</Button>} />

      <div className="px-4 md:px-8 space-y-4">
        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="danger" icon={<ShoppingCart className="w-4 h-4" />} onClick={() => abrirCompra()}>Registrar compra</Button>
          <Button variant="success" icon={<Tag className="w-4 h-4" />} onClick={() => abrirVenda()}>Registrar venda</Button>
        </div>

        {/* Busca e filtros */}
        <SearchInput value={busca} onChange={setBusca} placeholder="Pesquisar produto" />
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button onClick={() => setCategoriaFiltro('todas')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${categoriaFiltro === 'todas' ? 'bg-feira-primary text-white border-feira-primary' : 'border-feira-borda dark:border-feira-bordaDark text-neutral-500'}`}>
            Todas categorias
          </button>
          {categorias.map(c => (
            <button key={c} onClick={() => setCategoriaFiltro(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${categoriaFiltro === c ? 'bg-feira-primary text-white border-feira-primary' : 'border-feira-borda dark:border-feira-bordaDark text-neutral-500'}`}>
              {c}
            </button>
          ))}
          <button onClick={() => setSomenteBaixo(v => !v)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${somenteBaixo ? 'bg-feira-alerta text-white border-feira-alerta' : 'border-feira-borda dark:border-feira-bordaDark text-neutral-500'}`}>
            Estoque baixo
          </button>
        </div>

        {/* Lista de produtos */}
        <Card className="divide-y divide-feira-borda dark:divide-feira-bordaDark">
          {filtrados.length === 0 && (
            <EmptyState icon={<Boxes className="w-10 h-10" />} title="Nenhum produto encontrado"
              message="Cadastre seu primeiro produto para começar a controlar o estoque." />
          )}
          {filtrados.map(p => (
            <ProdutoCard key={p.id} produto={p}
              onEditar={() => abrirEdicao(p)}
              onExcluir={() => setExcluindo(p)}
              onAjustar={() => setAjustando(p)}
              onComprar={() => abrirCompra(p.id)}
              onVender={() => abrirVenda(p.id)} />
          ))}
        </Card>
      </div>

      <ProdutoModal open={modalProduto} onClose={() => setModalProduto(false)} editando={editando} />
      <CompraModal open={modalCompra} onClose={() => setModalCompra(false)} produtoIdInicial={produtoAtivo} />
      <VendaModal open={modalVenda} onClose={() => setModalVenda(false)} produtoIdInicial={produtoAtivo} />
      <AjusteEstoqueModal open={!!ajustando} onClose={() => setAjustando(null)} produto={ajustando} />
      <ConfirmDialog open={!!excluindo} title="Excluir produto"
        message={`Excluir "${excluindo?.nome}"? O histórico de movimentações relacionado também será removido.`}
        onCancel={() => setExcluindo(null)} onConfirm={confirmarExclusao} />
    </div>
  );
}
