import { useEffect, useState } from 'react';
import Modal from '@shared/ui/Modal';
import Button from '@shared/ui/Button';
import { Input, Select, Textarea } from '@shared/ui/Fields';
import { ajustarEstoque } from '@data/repositories';
import type { Produto } from '@core/entities';

export default function AjusteEstoqueModal({ open, onClose, produto }: { open: boolean; onClose: () => void; produto: Produto | null }) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) { setTipo('entrada'); setQuantidade(''); setObservacao(''); }
  }, [open]);

  if (!produto) return null;

  const salvar = async () => {
    const qtd = Number(quantidade.replace(',', '.'));
    if (!qtd || qtd <= 0) return;
    setSalvando(true);
    try {
      await ajustarEstoque(produto.id, qtd, tipo, 'Ajuste manual', observacao);
      onClose();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Ajustar estoque — ${produto.nome}`}
      footer={<Button fullWidth onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Confirmar ajuste'}</Button>}>
      <p className="text-sm text-neutral-500 mb-3">Estoque atual: <strong>{produto.quantidade} {produto.unidade}</strong></p>
      <Select label="Tipo de ajuste" value={tipo} onChange={e => setTipo(e.target.value as 'entrada' | 'saida')}
        options={[{ value: 'entrada', label: 'Adicionar ao estoque' }, { value: 'saida', label: 'Retirar do estoque' }]} />
      <Input label={`Quantidade (${produto.unidade})`} inputMode="decimal" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="0" autoFocus />
      <Textarea label="Motivo (opcional)" value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Ex: perda, quebra, contagem de inventário" />
      <p className="text-xs text-neutral-400">Use isto para correções de contagem, perdas ou quebras — não gera lançamento financeiro.</p>
    </Modal>
  );
}
