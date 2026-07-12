import { db, ensureSettings, updateSettings, addFornecedor, deleteFornecedor } from '@data/repositories';
import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { exportarBackup, importarBackup, limparTodosDados } from '@data/backup.service';
import { useTheme } from '@shared/contexts/ThemeContext';
import PageHeader from '@shared/layout/PageHeader';
import Card from '@shared/ui/Card';
import Button from '@shared/ui/Button';
import { Input } from '@shared/ui/Fields';
import { ConfirmDialog, EmptyState } from '@shared/ui/Misc';
import { Sun, Moon, Download, Upload, Plus, Trash, Truck } from '@shared/ui/icons';

export default function Config() {
  const { theme, toggleTheme } = useTheme();
  const settings = useLiveQuery(() => ensureSettings(), []);
  const fornecedores = useLiveQuery(() => db.fornecedores.toArray(), []) ?? [];

  const [novaCategoriaEntrada, setNovaCategoriaEntrada] = useState('');
  const [novaCategoriaSaida, setNovaCategoriaSaida] = useState('');
  const [novoFornecedor, setNovoFornecedor] = useState('');
  const [caixaInicial, setCaixaInicial] = useState('');
  const [confirmandoLimpeza, setConfirmandoLimpeza] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!settings) return null;

  const salvarCaixaInicial = async () => {
    const valor = Number((caixaInicial || String(settings.caixaInicial)).replace(',', '.'));
    await updateSettings({ caixaInicial: valor });
    setMensagem('Caixa inicial atualizado.');
    setTimeout(() => setMensagem(''), 2000);
  };

  const addCategoriaEntrada = async () => {
    if (!novaCategoriaEntrada.trim()) return;
    const novas = [...settings.categoriasEntrada, novaCategoriaEntrada.trim()];
    await updateSettings({ categoriasEntrada: novas });
    setNovaCategoriaEntrada('');
  };
  const removerCategoriaEntrada = async (cat: string) => {
    await updateSettings({ categoriasEntrada: settings.categoriasEntrada.filter(c => c !== cat) });
  };
  const addCategoriaSaida = async () => {
    if (!novaCategoriaSaida.trim()) return;
    const novas = [...settings.categoriasSaida, novaCategoriaSaida.trim()];
    await updateSettings({ categoriasSaida: novas });
    setNovaCategoriaSaida('');
  };
  const removerCategoriaSaida = async (cat: string) => {
    await updateSettings({ categoriasSaida: settings.categoriasSaida.filter(c => c !== cat) });
  };

  const salvarFornecedor = async () => {
    if (!novoFornecedor.trim()) return;
    await addFornecedor({ nome: novoFornecedor.trim() });
    setNovoFornecedor('');
  };

  const importar = async (file: File) => {
    try {
      await importarBackup(file);
      setMensagem('Backup restaurado com sucesso.');
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : 'Erro ao importar backup.');
    }
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div>
      <PageHeader title="Ajustes" subtitle="Preferências, categorias e backup" />

      <div className="px-4 md:px-8 space-y-4 pb-8 max-w-2xl">
        {mensagem && <Card className="p-3 text-sm text-feira-info bg-feira-info/10 border-none">{mensagem}</Card>}

        {/* Aparência */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Modo escuro</p>
            <p className="text-xs text-neutral-400">Reduz o brilho da tela — ideal para uso à noite</p>
          </div>
          <button onClick={toggleTheme} aria-label="Alternar modo escuro" className="p-2.5 rounded-xl bg-feira-borda dark:bg-feira-bordaDark">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </Card>

        {/* Caixa inicial */}
        <Card className="p-4">
          <p className="font-semibold text-sm mb-2">Caixa inicial</p>
          <p className="text-xs text-neutral-400 mb-3">Valor de referência somado ao cálculo do caixa atual (ex: saldo em dinheiro ao iniciar o uso do app).</p>
          <div className="flex gap-2">
            <Input placeholder={String(settings.caixaInicial)} value={caixaInicial} onChange={e => setCaixaInicial(e.target.value)} inputMode="decimal" className="mb-0" />
            <Button onClick={salvarCaixaInicial}>Salvar</Button>
          </div>
        </Card>

        {/* Categorias de entrada */}
        <Card className="p-4">
          <p className="font-semibold text-sm mb-2">Categorias de entrada</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {settings.categoriasEntrada.map(c => (
              <span key={c} className="flex items-center gap-1 text-xs font-medium bg-feira-entrada/10 text-feira-entrada px-2.5 py-1 rounded-full">
                {c}
                <button onClick={() => removerCategoriaEntrada(c)} aria-label={`Remover categoria ${c}`}><Trash className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Nova categoria" value={novaCategoriaEntrada} onChange={e => setNovaCategoriaEntrada(e.target.value)} className="mb-0" />
            <Button size="md" icon={<Plus className="w-4 h-4" />} onClick={addCategoriaEntrada}>Add</Button>
          </div>
        </Card>

        {/* Categorias de saída */}
        <Card className="p-4">
          <p className="font-semibold text-sm mb-2">Categorias de saída</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {settings.categoriasSaida.map(c => (
              <span key={c} className="flex items-center gap-1 text-xs font-medium bg-feira-saida/10 text-feira-saida px-2.5 py-1 rounded-full">
                {c}
                <button onClick={() => removerCategoriaSaida(c)} aria-label={`Remover categoria ${c}`}><Trash className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Nova categoria" value={novaCategoriaSaida} onChange={e => setNovaCategoriaSaida(e.target.value)} className="mb-0" />
            <Button size="md" icon={<Plus className="w-4 h-4" />} onClick={addCategoriaSaida}>Add</Button>
          </div>
        </Card>

        {/* Fornecedores */}
        <Card className="p-4">
          <p className="font-semibold text-sm mb-2 flex items-center gap-1.5"><Truck className="w-4 h-4" /> Fornecedores</p>
          {fornecedores.length === 0 && <EmptyState title="Nenhum fornecedor cadastrado" />}
          <div className="space-y-1.5 mb-3">
            {fornecedores.map(f => (
              <div key={f.id} className="flex items-center justify-between text-sm bg-black/[0.03] dark:bg-white/5 rounded-lg px-3 py-2">
                {f.nome}
                <button onClick={() => deleteFornecedor(f.id)} aria-label={`Remover fornecedor ${f.nome}`} className="text-feira-saida"><Trash className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Nome do fornecedor" value={novoFornecedor} onChange={e => setNovoFornecedor(e.target.value)} className="mb-0" />
            <Button size="md" icon={<Plus className="w-4 h-4" />} onClick={salvarFornecedor}>Add</Button>
          </div>
        </Card>

        {/* Backup */}
        <Card className="p-4">
          <p className="font-semibold text-sm mb-1">Backup dos dados</p>
          <p className="text-xs text-neutral-400 mb-3">Todos os dados ficam salvos apenas neste dispositivo. Exporte regularmente para não perder informações.</p>
          <div className="flex gap-2 flex-wrap">
            <Button icon={<Download className="w-4 h-4" />} onClick={() => exportarBackup()}>Exportar backup</Button>
            <Button variant="secondary" icon={<Upload className="w-4 h-4" />} onClick={() => fileRef.current?.click()}>Importar backup</Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={e => e.target.files?.[0] && importar(e.target.files[0])} />
          </div>
        </Card>

        {/* Zona de risco */}
        <Card className="p-4 border-feira-saida/30">
          <p className="font-semibold text-sm text-feira-saida mb-1">Zona de risco</p>
          <p className="text-xs text-neutral-400 mb-3">Apaga entradas, saídas, produtos, compras e vendas. Faça um backup antes.</p>
          <Button variant="danger" onClick={() => setConfirmandoLimpeza(true)}>Limpar todos os dados</Button>
        </Card>
      </div>

      <ConfirmDialog open={confirmandoLimpeza} title="Limpar todos os dados"
        message="Esta ação apaga permanentemente todos os registros financeiros, produtos e movimentações. Não pode ser desfeita. Deseja continuar?"
        confirmLabel="Sim, apagar tudo"
        onCancel={() => setConfirmandoLimpeza(false)}
        onConfirm={async () => { await limparTodosDados(); setConfirmandoLimpeza(false); }} />
    </div>
  );
}
