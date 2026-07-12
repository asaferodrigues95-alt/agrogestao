import { useEffect, useState } from 'react';
import Modal from '@shared/ui/Modal';
import Button from '@shared/ui/Button';
import { Input, Select, Textarea } from '@shared/ui/Fields';
import { addEntrada, addSaida, updateEntrada, updateSaida } from '@data/repositories';
import { todayStr, nowTimeStr } from '@shared/utils/datetime';
import type { Entrada, Saida } from '@core/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  tipo: 'entrada' | 'saida';
  categorias: string[];
  editando?: Entrada | Saida | null;
}

export default function LancamentoModal({ open, onClose, tipo, categorias, editando }: Props) {
  const [valor, setValor] = useState('');
  const [data, setData] = useState(todayStr());
  const [hora, setHora] = useState(nowTimeStr());
  const [categoria, setCategoria] = useState(categorias[0] ?? 'Outros');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      if (editando) {
        setValor(String(editando.valor));
        setData(editando.data);
        setHora(editando.hora);
        setCategoria(editando.categoria);
        setObservacao(editando.observacao ?? '');
      } else {
        setValor(''); setData(todayStr()); setHora(nowTimeStr());
        setCategoria(categorias[0] ?? 'Outros'); setObservacao('');
      }
    }
  }, [open, editando]); // eslint-disable-line react-hooks/exhaustive-deps

  const salvar = async () => {
    const valorNum = Number(valor.replace(',', '.'));
    if (!valorNum || valorNum <= 0) return;
    setSalvando(true);
    try {
      if (editando) {
        if (tipo === 'entrada') await updateEntrada(editando.id, { valor: valorNum, data, hora, categoria, observacao });
        else await updateSaida(editando.id, { valor: valorNum, data, hora, categoria, observacao });
      } else {
        if (tipo === 'entrada') await addEntrada({ valor: valorNum, data, hora, categoria, observacao });
        else await addSaida({ valor: valorNum, data, hora, categoria, observacao });
      }
      onClose();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editando ? `Editar ${tipo === 'entrada' ? 'entrada' : 'saída'}` : `Nova ${tipo === 'entrada' ? 'entrada' : 'saída'}`}
      footer={
        <Button variant={tipo === 'entrada' ? 'success' : 'danger'} fullWidth onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </Button>
      }>
      <Input label="Valor (R$)" inputMode="decimal" placeholder="0,00" value={valor}
        onChange={e => setValor(e.target.value)} autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data" type="date" value={data} onChange={e => setData(e.target.value)} />
        <Input label="Hora" type="time" value={hora} onChange={e => setHora(e.target.value)} />
      </div>
      <Select label="Categoria" value={categoria} onChange={e => setCategoria(e.target.value)}
        options={categorias.map(c => ({ value: c, label: c }))} />
      <Textarea label="Observação (opcional)" value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Detalhes sobre este lançamento" />
    </Modal>
  );
}
