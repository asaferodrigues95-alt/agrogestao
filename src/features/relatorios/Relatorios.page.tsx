import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';
import { db, ensureSettings } from '@data/repositories';
import PageHeader from '@shared/layout/PageHeader';
import Card from '@shared/ui/Card';
import { EmptyState } from '@shared/ui/Misc';
import ChartCard from './components/ChartCard';
import { formatMoeda, nomeMes } from '@shared/utils/format';
import {
  somaValores, calcularCaixa, ultimos12Meses, rankingProdutos, comparativoComprasVendas,
  isHoje, isMesAtual, isAnoAtual
} from '@core/calculations/business-calculations';

const CORES_CATEGORIA = ['#0f3d2e', '#1f8a4c', '#d98e3c', '#25636b', '#c0392b', '#d9a441', '#6b7280'];
type Periodo = 'diario' | 'semanal' | 'mensal' | 'anual';

export default function Relatorios() {
  const [periodo, setPeriodo] = useState<Periodo>('mensal');
  const settings = useLiveQuery(() => ensureSettings(), []);
  const entradas = useLiveQuery(() => db.entradas.toArray(), []) ?? [];
  const saidas = useLiveQuery(() => db.saidas.toArray(), []) ?? [];
  const produtos = useLiveQuery(() => db.produtos.toArray(), []) ?? [];
  const compras = useLiveQuery(() => db.compras.toArray(), []) ?? [];
  const vendas = useLiveQuery(() => db.vendas.toArray(), []) ?? [];

  // ---- Resumo do período selecionado ----
  const filtroPeriodo = (data: string) => {
    if (periodo === 'diario') return isHoje(data);
    if (periodo === 'mensal') return isMesAtual(data);
    if (periodo === 'anual') return isAnoAtual(data);
    // semanal: últimos 7 dias
    const limite = new Date(); limite.setDate(limite.getDate() - 7);
    return new Date(data) >= limite;
  };
  const entradasPeriodo = entradas.filter(e => filtroPeriodo(e.data));
  const saidasPeriodo = saidas.filter(s => filtroPeriodo(s.data));
  const totalEntradas = somaValores(entradasPeriodo);
  const totalSaidas = somaValores(saidasPeriodo);

  // ---- Séries mensais (últimos 12 meses) ----
  const meses = ultimos12Meses();
  const serieMensal = useMemo(() => meses.map(mes => {
    const eMes = entradas.filter(e => e.data.slice(0, 7) === mes);
    const sMes = saidas.filter(s => s.data.slice(0, 7) === mes);
    const totalE = somaValores(eMes);
    const totalS = somaValores(sMes);
    return { mes: nomeMes(Number(mes.slice(5, 7)) - 1), entradas: totalE, saidas: totalS, lucro: totalE - totalS };
  }), [entradas, saidas]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Evolução do caixa acumulado ----
  const evolucaoCaixa = useMemo(() => {
    let acumulado = settings?.caixaInicial ?? 0;
    return serieMensal.map(m => {
      acumulado += m.lucro;
      return { mes: m.mes, caixa: acumulado };
    });
  }, [serieMensal, settings]);

  // ---- Vendas por produto (top 8) ----
  const ranking = useMemo(() => rankingProdutos(vendas, produtos), [vendas, produtos]);
  const maisVendidos = [...ranking].sort((a, b) => b.quantidadeVendida - a.quantidadeVendida).slice(0, 8);
  const menosVendidos = [...ranking].sort((a, b) => a.quantidadeVendida - b.quantidadeVendida).slice(0, 5);
  const maiorFaturamento = [...ranking].sort((a, b) => b.faturamento - a.faturamento).slice(0, 5);
  const maiorMargem = [...ranking].sort((a, b) => b.margem - a.margem).slice(0, 5);
  const semEstoque = produtos.filter(p => p.quantidade <= 0);

  // ---- Estoque por categoria ----
  const estoquePorCategoria = useMemo(() => {
    const mapa: Record<string, number> = {};
    produtos.forEach(p => { mapa[p.categoria] = (mapa[p.categoria] ?? 0) + p.quantidade * p.precoCompra; });
    return Object.entries(mapa).map(([categoria, valor]) => ({ categoria, valor }));
  }, [produtos]);

  // ---- Comparação compras vs vendas ----
  const comparativo = useMemo(() => comparativoComprasVendas(compras, vendas).map(c => ({ ...c, mes: nomeMes(Number(c.mes.slice(5, 7)) - 1) })), [compras, vendas]);

  const periodos: { value: Periodo; label: string }[] = [
    { value: 'diario', label: 'Diário' }, { value: 'semanal', label: 'Semanal' },
    { value: 'mensal', label: 'Mensal' }, { value: 'anual', label: 'Anual' }
  ];

  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Financeiro e desempenho do estoque" />

      <div className="px-4 md:px-8 space-y-6 pb-6">
        {/* Seletor de período + resumo */}
        <div className="flex gap-2">
          {periodos.map(p => (
            <button key={p.value} onClick={() => setPeriodo(p.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${periodo === p.value ? 'bg-feira-primary text-white border-feira-primary' : 'border-feira-borda dark:border-feira-bordaDark text-neutral-500'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4"><p className="text-xs text-neutral-400">Entradas</p><p className="font-display font-semibold text-feira-entrada">{formatMoeda(totalEntradas)}</p></Card>
          <Card className="p-4"><p className="text-xs text-neutral-400">Saídas</p><p className="font-display font-semibold text-feira-saida">{formatMoeda(totalSaidas)}</p></Card>
          <Card className="p-4"><p className="text-xs text-neutral-400">Lucro líquido</p><p className={`font-display font-semibold ${totalEntradas - totalSaidas >= 0 ? 'text-feira-entrada' : 'text-feira-saida'}`}>{formatMoeda(totalEntradas - totalSaidas)}</p></Card>
        </div>

        {/* Gráficos financeiros mensais */}
        <ChartCard title="Entradas e saídas por mês" subtitle="Últimos 12 meses">
          <ResponsiveContainer>
            <BarChart data={serieMensal}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis fontSize={12} width={40} />
              <Tooltip formatter={(v: number) => formatMoeda(v)} />
              <Legend />
              <Bar dataKey="entradas" name="Entradas" fill="#1f8a4c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" name="Saídas" fill="#c0392b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lucro por mês" subtitle="Últimos 12 meses">
          <ResponsiveContainer>
            <LineChart data={serieMensal}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis fontSize={12} width={40} />
              <Tooltip formatter={(v: number) => formatMoeda(v)} />
              <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#0f3d2e" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Evolução do caixa" subtitle="Saldo acumulado mês a mês">
          <ResponsiveContainer>
            <LineChart data={evolucaoCaixa}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis fontSize={12} width={40} />
              <Tooltip formatter={(v: number) => formatMoeda(v)} />
              <Line type="monotone" dataKey="caixa" name="Caixa" stroke="#25636b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Compras x Vendas" subtitle="Comparação mensal">
          <ResponsiveContainer>
            <BarChart data={comparativo}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis fontSize={12} width={40} />
              <Tooltip formatter={(v: number) => formatMoeda(v)} />
              <Legend />
              <Bar dataKey="compras" name="Compras" fill="#c0392b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vendas" name="Vendas" fill="#1f8a4c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vendas por produto" subtitle="Quantidade vendida (top 8)">
          {maisVendidos.length === 0 ? <EmptyState title="Sem vendas registradas ainda" /> : (
            <ResponsiveContainer>
              <BarChart data={maisVendidos} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="nome" fontSize={12} width={90} />
                <Tooltip />
                <Bar dataKey="quantidadeVendida" name="Qtd. vendida" fill="#d98e3c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Estoque por categoria" subtitle="Valor em R$ por categoria">
          {estoquePorCategoria.length === 0 ? <EmptyState title="Nenhum produto cadastrado" /> : (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={estoquePorCategoria} dataKey="valor" nameKey="categoria" cx="50%" cy="50%" outerRadius={90} label={(entry: { categoria: string }) => entry.categoria}>
                  {estoquePorCategoria.map((_, i) => <Cell key={i} fill={CORES_CATEGORIA[i % CORES_CATEGORIA.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatMoeda(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Tabelas de ranking de produtos */}
        <div className="grid md:grid-cols-2 gap-4">
          <RankingTable titulo="Produtos mais vendidos" dados={maisVendidos.map(p => ({ nome: p.nome, valor: `${p.quantidadeVendida} un.` }))} />
          <RankingTable titulo="Produtos menos vendidos" dados={menosVendidos.map(p => ({ nome: p.nome, valor: `${p.quantidadeVendida} un.` }))} />
          <RankingTable titulo="Maior faturamento" dados={maiorFaturamento.map(p => ({ nome: p.nome, valor: formatMoeda(p.faturamento) }))} />
          <RankingTable titulo="Maior margem de lucro" dados={maiorMargem.map(p => ({ nome: p.nome, valor: `${p.margem}%` }))} />
        </div>

        <Card className="p-4">
          <p className="text-sm font-semibold mb-2">Produtos sem estoque</p>
          {semEstoque.length === 0
            ? <p className="text-sm text-neutral-400">Nenhum produto zerado no momento.</p>
            : <ul className="text-sm space-y-1">{semEstoque.map(p => <li key={p.id} className="flex justify-between"><span>{p.nome}</span><span className="text-feira-saida font-medium">0 {p.unidade}</span></li>)}</ul>}
        </Card>
      </div>
    </div>
  );
}

function RankingTable({ titulo, dados }: { titulo: string; dados: { nome: string; valor: string }[] }) {
  return (
    <Card className="p-4">
      <p className="text-sm font-semibold mb-2">{titulo}</p>
      {dados.length === 0 ? <p className="text-sm text-neutral-400">Sem dados suficientes.</p> : (
        <ol className="text-sm space-y-1.5">
          {dados.map((d, i) => (
            <li key={i} className="flex justify-between">
              <span className="truncate">{i + 1}. {d.nome}</span>
              <span className="font-medium shrink-0 ml-2">{d.valor}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
