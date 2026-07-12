import type { ReactNode } from 'react';
import { X } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

// No mobile, o modal sobe do rodapé (comportamento familiar de app financeiro).
// No desktop, aparece centralizado.
export default function Modal({ open, onClose, title, children, footer }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-feira-surface dark:bg-feira-surfaceDark w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-xl
        max-h-[92vh] flex flex-col animate-[slideUp_0.2s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-feira-borda dark:border-feira-bordaDark">
          <h2 className="font-display font-semibold text-lg text-feira-primary dark:text-white">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <X />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto grow">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-feira-borda dark:border-feira-bordaDark">{footer}</div>}
      </div>
    </div>
  );
}
