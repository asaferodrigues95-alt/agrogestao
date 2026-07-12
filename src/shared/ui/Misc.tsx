import type { ReactNode } from 'react';
import Button from './Button';
import Modal from './Modal';
import { Search as SearchIcon, AlertTriangle } from './icons';

// ---------- ConfirmDialog ----------
interface ConfirmProps {
  open: boolean; title: string; message: string;
  onConfirm: () => void; onCancel: () => void;
  confirmLabel?: string;
}
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Excluir' }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" fullWidth onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      }>
      <div className="flex gap-3 items-start text-neutral-600 dark:text-neutral-300">
        <AlertTriangle className="text-feira-alerta shrink-0 mt-0.5" />
        <p>{message}</p>
      </div>
    </Modal>
  );
}

// ---------- Badge ----------
type BadgeColor = 'entrada' | 'saida' | 'info' | 'alerta' | 'neutro';
const badgeColors: Record<BadgeColor, string> = {
  entrada: 'bg-feira-entrada/10 text-feira-entrada',
  saida: 'bg-feira-saida/10 text-feira-saida',
  info: 'bg-feira-info/10 text-feira-info',
  alerta: 'bg-feira-alerta/15 text-feira-alerta',
  neutro: 'bg-neutral-200 dark:bg-white/10 text-neutral-600 dark:text-neutral-300'
};
export function Badge({ color = 'neutro', children }: { color?: BadgeColor; children: ReactNode }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColors[color]}`}>{children}</span>;
}

// ---------- EmptyState ----------
export function EmptyState({ icon, title, message }: { icon?: ReactNode; title: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 text-neutral-400">
      {icon && <div className="mb-3 opacity-60">{icon}</div>}
      <p className="font-medium text-neutral-500 dark:text-neutral-300">{title}</p>
      {message && <p className="text-sm mt-1 max-w-xs">{message}</p>}
    </div>
  );
}

// ---------- SearchInput ----------
export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-[18px] h-[18px]" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Pesquisar...'}
        className="w-full rounded-xl border border-feira-borda dark:border-feira-bordaDark bg-white dark:bg-feira-bgDark
          pl-9 pr-3.5 py-2.5 text-[15px] text-feira-primary dark:text-white placeholder:text-neutral-400
          focus:outline-none focus:ring-2 focus:ring-feira-primary/40 dark:focus:ring-feira-accent/40 transition"
      />
    </div>
  );
}
