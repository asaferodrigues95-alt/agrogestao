import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db, ensureSettings } from '@data/repositories';
import PageHeader from '@shared/layout/PageHeader';
import StatCard from './components/StatCard';
import Card from '@shared/ui/Card';
import { Badge, EmptyState } from '@shared/ui/Misc';
import { Wallet, ArrowUp, ArrowDown, Boxes, AlertTriangle, ChevronRight, Tag, ShoppingCart } from '@shared/ui/icons';
import { formatMoeda, formatDataHora } from '@shared/utils/format';
import {
  isHoje, isMesAtual, somaValores, calcularCaixa, valorTotalEstoque,
  quantidadeTotalEstoque, produtosEstoqueBaixo, produtosSemMovimentacao
} from '@core/calculations/business-calculations';

export default function Dashboard() {
  const settings = useLiveQuery(() => ensureSettings(), []);
  const entradas = useLiveQuery(() => db.entradas.toArray(), []) ?? [];
  const saidas = useLiveQuery(() => db.saidas.toArray(), []) ?? [];
  const produtos = useLiveQuery(() => db.produtos.toArray(), []) ?? [];
  const compras = useLiveQuery(() => db.compras.toArray(), []) ?? [];
  const vendas = useLiveQuery(() => db.vendas.toArray(), []) ?? [];

  if (!settings) return null;

  const entradasHoje = entradas.filter(e => isHoje(e.data));
  const saidasHoje = saidas.filter(s => isHoje(s.data));
  const entradasMes = entradas.filter(e => isMesAtual(e.data));
  const saidasMes = saidas.filter(s => isMesAtual(s.data));

  const totalEntradasHoje = somaValores(entradasHoje);
  const totalSaidasHoje = somaValores(saidasHoje);
  const totalEntradasMes = somaValores(entradasMes);
  const totalSaidasMes = somaValores(saidasMes);
  const caixaAtual = calcularCaixa(entradas, saidas, settings.caixaInicial);

  const estoqueValor = valorTotalEstoque(produtos);
  const estoqueQtd = quantidadeTotalEstoque(produtos);
  const baixoEstoque = produtosEstoqueBaixo(produtos);
  const semMovimentacao = produtosSemMovimentacao(produtos, 15);

  // Une os últimos lançamentos de todas as origens para o feed de atividades.
  const movimentos = [
    ...entradas.map(e => ({ id: e.id, tipo: 'Entrada' as const, cor: 'entrada' as const, valor: e.valor, data: e.data, hora: e.hora, desc: e.observacao || e.categoria, createdAt: e.createdAt })),
    ...saidas.map(s => ({ id: s.id, tipo: 'Saída' as const, cor: 'saida' as const, valor: s.valor, data: s.data, hora: s.hora, desc: s.observacao || s.categoria, createdAt: s.createdAt }))
  ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

  return (
    <div>
      <PageHeader title="Painel" subtitle="Visão geral da sua feira, hoje" />

      <div className="px-4 md:px-8 space-y-6">
        {/* Caixa atual em destaque */}
        <Card className="p-5 bg-feira-primary text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">Caixa atual</p>
              <p className="font-display font-semibold text-3xl mt-1">{formatMoeda(caixaAtual)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <Wallet />
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1 text-feira-entrada bg-white/90 rounded-lg px-2 py-1">
              <ArrowUp className="w-4 h-4" /> {formatMoeda(totalEntradasHoje)} hoje
            </span>
            <span className="flex items-center gap-1 text-feira-saida bg-white/90 rounded-lg px-2 py-1">
              <ArrowDown className="w-4 h-4" /> {formatMoeda(totalSaidasHoje)} hoje
            </span>
          </div>
        </Card>

        {/* Ações rápidas — a ação mais frequente do dia (vender) fica a 1 toque do Painel,
            sem precisar entrar em "Estoque" primeiro (ver PRODUCT.md, jornada do feirante) */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/estoque?acao=vender" className="flex items-center justify-center gap-2 bg-feira-entrada text-white font-semibold text-sm py-3 rounded-xl">
            <Tag className="w-4 h-4" /> Vender
          </Link>
          <Link to="/estoque?acao=comprar" className="flex items-center justify-center gap-2 bg-feira-saida text-white font-semibold text-sm py-3 rounded-xl">
            <ShoppingCart className="w-4 h-4" /> Comprar
          </Link>
        </div>

        {/* Alertas */}
        {(baixoEstoque.length > 0 || semMovimentacao.length > 0) && (
          <Card className="p-4 border-feira-alerta/40">
            <div className="flex items-center gap-2 mb-2 text-feira-alerta font-semibold text-sm">
              <AlertTriangle className="w-[18px] h-[18px]" /> Avisos
            </div>
            <ul className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300">
              {baixoEstoque.slice(0, 4).map(p => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.nome} está com estoque baixo</span>
                  <Badge color="alerta">{p.quantidade} {p.unidade}</Badge>
                </li>
              ))}
              {semMovimentacao.slice(0, 3).map(p => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.nome} sem movimentação há dias</span>
                  <Badge color="neutro">parado</Badge>
                </li>
              ))}
            </ul>
            <Link to="/estoque" className="text-xs font-semibold text-feira-primary dark:text-feira-accent mt-3 flex items-center gap-0.5">
              Ver estoque <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        )}

        {/* Indicadores do dia */}
        <div>
          <p className="text-sm font-semibold text-neutral-500 mb-2">Hoje</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Entradas" value={formatMoeda(totalEntradasHoje)} tone="entrada" icon={<ArrowUp className="w-4 h-4" />} />
            <StatCard label="Saídas" value={formatMoeda(totalSaidasHoje)} tone="saida" icon={<ArrowDown className="w-4 h-4" />} />
            <StatCard label="Lucro do dia" value={formatMoeda(totalEntradasHoje - totalSaidasHoje)} tone={totalEntradasHoje - totalSaidasHoje >= 0 ? 'entrada' : 'saida'} />
          </div>
        </div>

        {/* Indicadores do mês */}
        <div>
          <p className="text-sm font-semibold text-neutral-500 mb-2">Este mês</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Entradas" value={formatMoeda(totalEntradasMes)} tone="entrada" icon={<ArrowUp className="w-4 h-4" />} />
            <StatCard label="Saídas" value={formatMoeda(totalSaidasMes)} tone="saida" icon={<ArrowDown className="w-4 h-4" />} />
            <StatCard label="Lucro do mês" value={formatMoeda(totalEntradasMes - totalSaidasMes)} tone={totalEntradasMes - totalSaidasMes >= 0 ? 'entrada' : 'saida'} />
          </div>
        </div>

        {/* Estoque */}
        <div>
          <p className="text-sm font-semibold text-neutral-500 mb-2">Estoque</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Valor em estoque" value={formatMoeda(estoqueValor)} tone="info" icon={<Boxes className="w-4 h-4" />} />
            <StatCard label="Itens em estoque" value={`${estoqueQtd}`} tone="primary" sub={`${produtos.length} produtos cadastrados`} />
            <StatCard label="Estoque baixo" value={`${baixoEstoque.length}`} tone={baixoEstoque.length > 0 ? 'alerta' : 'primary'} />
          </div>
        </div>

        {/* Últimas movimentações */}
        <div className="pb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-neutral-500">Últimas movimentações</p>
            <Link to="/historico" className="text-xs font-semibold text-feira-primary dark:text-feira-accent">Ver tudo</Link>
          </div>
          <Card className="divide-y divide-feira-borda dark:divide-feira-bordaDark">
            {movimentos.length === 0 && <EmptyState title="Nenhuma movimentação ainda" message="Registre uma entrada, saída, compra ou venda para começar." />}
            {movimentos.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.desc}</p>
                  <p className="text-xs text-neutral-400">{formatDataHora(m.data, m.hora)}</p>
                </div>
                <Badge color={m.cor}>{m.cor === 'entrada' ? '+' : '-'} {formatMoeda(m.valor)}</Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
