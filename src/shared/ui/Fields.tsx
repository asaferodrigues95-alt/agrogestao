import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const baseInput = `w-full rounded-xl border border-feira-borda dark:border-feira-bordaDark
  bg-white dark:bg-feira-bgDark px-3.5 py-2.5 text-[15px] text-feira-primary dark:text-white
  placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-feira-primary/40 dark:focus:ring-feira-accent/40 transition`;

interface FieldWrapProps { label?: string; hint?: string; error?: string; children: React.ReactNode; }
function FieldWrap({ label, hint, error, children }: FieldWrapProps) {
  return (
    <label className="block mb-3.5">
      {label && <span className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-200">{label}</span>}
      {children}
      {hint && !error && <span className="block text-xs text-neutral-400 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-feira-saida mt-1">{error}</span>}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; hint?: string; error?: string;
}
export function Input({ label, hint, error, className = '', ...rest }: InputProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <input className={`${baseInput} ${className}`} {...rest} />
    </FieldWrap>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; hint?: string; error?: string; options: { value: string; label: string }[];
}
export function Select({ label, hint, error, options, className = '', ...rest }: SelectProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <select className={`${baseInput} ${className}`} {...rest}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FieldWrap>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; hint?: string; error?: string;
}
export function Textarea({ label, hint, error, className = '', ...rest }: TextareaProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <textarea className={`${baseInput} resize-none ${className}`} rows={2} {...rest} />
    </FieldWrap>
  );
}
