import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Modal from '@shared/ui/Modal';
import Button from '@shared/ui/Button';
import { Input, Select, Textarea } from '@shared/ui/Fields';
import { db, registrarVenda } from '@data/repositories';
import { todayStr, nowTimeStr } from '@shared/utils/datetime';
import { formatMoeda } from '@shared/utils/format';

export default function VendaModal({ open, onClose, produtoIdInicial }: { open: boolean; onClose: () => void; produtoIdInicial?: string }) {
  const produtos = useLiveQuery(() => db.produtos.toArray(), []) ?? [];
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [data, setData] = useState(todayStr());
  const [hora, setHora] = useState(nowTimeStr());
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      const pid = produtoIdInicial ?? produtos[0]?.id ?? '';
      setProdutoId(pid);
      setQuantidade('');
      setPrecoUnitario(String(produtos.find(p => p.id === pid)?.precoVenda ?? ''));
      setData(todayStr()); setHora(nowTimeStr()); setObservacao(''); setErro('');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const produto = produtos.find(p => p.id === produtoId);
  const qtdNum = Number(quantidade.replace(',', '.')) || 0;
  const precoNum = Number(precoUnitario.replace(',', '.')) || 0;
  const total = qtdNum * precoNum;
  const lucroEstimado = produto ? total - produto.precoCompra * qtdNum : 0;

  const escolherProduto = (id: string) => {
    setProdutoId(id);
    const p = produtos.find(pr => pr.id === id);
    if (p) setPrecoUnitario(String(p.precoVenda));
  };

  const salvar = async () => {
    setErro('');
    if (!produtoId) { setErro('Selecione um produto.'); return; }
    if (qtdNum <= 0) { setErro('Informe uma quantidade válida.'); return; }
    if (precoNum <= 0) { setErro('Informe um preço unitário válido.'); return; }
    setSalvando(true);
    try {
      await registrarVenda({ produtoId, quantidade: qtdNum, precoUnitario: precoNum, data, hora, observacao });
      onClose();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar venda.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar venda"
      footer={
        <div>
          {erro && <p className="text-xs text-feira-saida mb-2">{erro}</p>}
          <Button variant="success" fullWidth onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : `Confirmar venda${total > 0 ? ' — ' + formatMoeda(total) : ''}`}
          </Button>
        </div>
      }>
      <Select label="Produto" value={produtoId} onChange={e => escolherProduto(e.target.value)}
        options={produtos.length ? produtos.map(p => ({ value: p.id, label: `${p.nome} (${p.quantidade} ${p.unidade} disponível)` })) : [{ value: '', label: 'Cadastre um produto primeiro' }]} />
      <div className="grid grid-cols-2 gap-3">
        <Input label={`Quantidade${produto ? ` (${produto.unidade})` : ''}`} inputMode="decimal" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="0" />
        <Input label="Preço unitário (R$)" inputMode="decimal" value={precoUnitario} onChange={e => setPrecoUnitario(e.target.value)} placeholder="0,00" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data" type="date" value={data} onChange={e => setData(e.target.value)} />
        <Input label="Hora" type="time" value={hora} onChange={e => setHora(e.target.value)} />
      </div>
      <Textarea label="Observação (opcional)" value={observacao} onChange={e => setObservacao(e.target.value)} />
      {qtdNum > 0 && precoNum > 0 && (
        <p className={`text-sm font-medium ${lucroEstimado >= 0 ? 'text-feira-entrada' : 'text-feira-saida'}`}>
          Lucro estimado desta venda: {formatMoeda(lucroEstimado)}
        </p>
      )}
      <p className="text-xs text-neutral-400">Isso já lança a entrada no seu financeiro e desconta sozinho do estoque.</p>
    </Modal>
  );
}
