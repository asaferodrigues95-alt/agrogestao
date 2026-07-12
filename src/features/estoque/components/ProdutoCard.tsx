import type { Produto } from '@core/entities';
import { Badge } from '@shared/ui/Misc';
import { Edit, Trash, ArrowUp, ArrowDown, ShoppingCart, Tag } from '@shared/ui/icons';
import { formatMoeda, diasDesde } from '@shared/utils/format';

interface Props {
  produto: Produto;
  onEditar: () => void;
  onExcluir: () => void;
  onAjustar: () => void;
  onComprar: () => void;
  onVender: () => void;
}

export default function ProdutoCard({ produto, onEditar, onExcluir, onAjustar, onComprar, onVender }: Props) {
  const baixo = produto.quantidade <= produto.quantidadeMinima;
  const parado = diasDesde(produto.ultimaMovimentacao) >= 15;
  const margem = produto.precoVenda > 0 ? ((produto.precoVenda - produto.precoCompra) / produto.precoVenda) * 100 : 0;

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm truncate">{produto.nome}</p>
            {baixo && <Badge color="alerta">estoque baixo</Badge>}
            {parado && <Badge color="neutro">parado</Badge>}
          </div>
          <p className="text-xs text-neutral-400">{produto.categoria} · {formatMoeda(produto.precoCompra)} custo · {formatMoeda(produto.precoVenda)} venda · margem {margem.toFixed(0)}%</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEditar} aria-label={`Editar ${produto.nome}`} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400"><Edit className="w-4 h-4" /></button>
          <button onClick={onExcluir} aria-label={`Excluir ${produto.nome}`} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-feira-saida"><Trash className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <span className={`font-display font-semibold text-lg ${baixo ? 'text-feira-alerta' : 'text-feira-primary dark:text-white'}`}>
          {produto.quantidade} <span className="text-xs font-body font-normal text-neutral-400">{produto.unidade}</span>
        </span>
        <div className="flex gap-1.5">
          <button onClick={onComprar} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-feira-saida/10 text-feira-saida">
            <ShoppingCart className="w-3.5 h-3.5" /> Comprar
          </button>
          <button onClick={onVender} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-feira-entrada/10 text-feira-entrada">
            <Tag className="w-3.5 h-3.5" /> Vender
          </button>
          <button onClick={onAjustar} aria-label={`Ajustar estoque de ${produto.nome}`} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-feira-info/10 text-feira-info">
            <ArrowUp className="w-3.5 h-3.5" /><ArrowDown className="w-3.5 h-3.5 -ml-2" /> Ajustar
          </button>
        </div>
      </div>
    </div>
  );
}
