import { db, addProduto, updateProduto } from '@data/repositories';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Modal from '@shared/ui/Modal';
import Button from '@shared/ui/Button';
import { Input, Select } from '@shared/ui/Fields';
import type { Produto } from '@core/entities';
import { precoVendaSugerido } from '@core/calculations/business-calculations';
import { formatMoeda } from '@shared/utils/format';

interface Props { open: boolean; onClose: () => void; editando?: Produto | null; }

const unidades = ['kg', 'unidade', 'caixa', 'saco', 'dúzia', 'litro'];

export default function ProdutoModal({ open, onClose, editando }: Props) {
  const fornecedores = useLiveQuery(() => db.fornecedores.toArray(), []) ?? [];
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [unidade, setUnidade] = useState('kg');
  const [quantidade, setQuantidade] = useState('0');
  const [quantidadeMinima, setQuantidadeMinima] = useState('5');
  const [precoCompra, setPrecoCompra] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [margemDesejada, setMargemDesejada] = useState('30');
  const [fornecedorId, setFornecedorId] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      if (editando) {
        setNome(editando.nome); setCategoria(editando.categoria); setUnidade(editando.unidade);
        setQuantidade(String(editando.quantidade)); setQuantidadeMinima(String(editando.quantidadeMinima));
        setPrecoCompra(String(editando.precoCompra)); setPrecoVenda(String(editando.precoVenda));
        setFornecedorId(editando.fornecedorId ?? '');
      } else {
        setNome(''); setCategoria('Outros'); setUnidade('kg'); setQuantidade('0');
        setQuantidadeMinima('5'); setPrecoCompra(''); setPrecoVenda(''); setFornecedorId('');
      }
      setMargemDesejada('30');
    }
  }, [open, editando]);

  const custoNum = Number(precoCompra.replace(',', '.')) || 0;
  const margemNum = Number(margemDesejada.replace(',', '.')) || 0;
  const sugestao = precoVendaSugerido(custoNum, margemNum);

  const usarSugestao = () => {
    if (sugestao !== null) setPrecoVenda(String(sugestao));
  };

  const salvar = async () => {
    if (!nome.trim()) return;
    setSalvando(true);
    try {
      const payload = {
        nome: nome.trim(), categoria, unidade: unidade as Produto['unidade'],
        quantidade: Number(quantidade) || 0, quantidadeMinima: Number(quantidadeMinima) || 0,
        precoCompra: custoNum,
        precoVenda: Number(precoVenda.replace(',', '.')) || 0,
        fornecedorId: fornecedorId || undefined
      };
      if (editando) await updateProduto(editando.id, payload);
      else await addProduto(payload);
      onClose();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editando ? 'Editar produto' : 'Novo produto'}
      footer={<Button fullWidth onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar produto'}</Button>}>
      <Input label="Nome do produto" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Banana prata" autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Categoria" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ex: Frutas" />
        <Select label="Unidade" value={unidade} onChange={e => setUnidade(e.target.value)} options={unidades.map(u => ({ value: u, label: u }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label={editando ? 'Quantidade em estoque' : 'Quantidade inicial'} inputMode="decimal" value={quantidade} onChange={e => setQuantidade(e.target.value)}
          hint={editando ? 'Use "Ajustar estoque" para movimentar' : undefined} disabled={!!editando} />
        <Input label="Estoque mínimo" inputMode="decimal" value={quantidadeMinima} onChange={e => setQuantidadeMinima(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Preço de compra (custo)" inputMode="decimal" placeholder="0,00" value={precoCompra} onChange={e => setPrecoCompra(e.target.value)} />
        <Input label="Preço de venda" inputMode="decimal" placeholder="0,00" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} />
      </div>

      <div className="rounded-xl border border-feira-borda dark:border-feira-bordaDark bg-black/[0.02] dark:bg-white/5 p-3 mb-3.5">
        <p className="text-xs font-semibold text-neutral-500 mb-2">Não sabe qual preço cobrar? Calcule aqui</p>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input label="Margem de lucro desejada (%)" inputMode="decimal" value={margemDesejada}
              onChange={e => setMargemDesejada(e.target.value)} placeholder="Ex: 30" className="mb-0" />
          </div>
          <Button type="button" variant="secondary" onClick={usarSugestao} disabled={sugestao === null}>
            Usar sugestão
          </Button>
        </div>
        {custoNum > 0 && (
          <p className="text-xs text-neutral-500 mt-2">
            {sugestao !== null
              ? <>Preço de venda sugerido: <strong className="text-feira-entrada">{formatMoeda(sugestao)}</strong></>
              : 'Informe um custo e uma margem entre 1% e 99% para calcular.'}
          </p>
        )}
      </div>

      <Select label="Fornecedor (opcional)" value={fornecedorId} onChange={e => setFornecedorId(e.target.value)}
        options={[{ value: '', label: 'Nenhum' }, ...fornecedores.map(f => ({ value: f.id, label: f.nome }))]} />
    </Modal>
  );
}
