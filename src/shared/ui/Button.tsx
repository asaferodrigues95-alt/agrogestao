import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-feira-primary text-white hover:bg-feira-primaryLight active:scale-[0.98]',
  secondary: 'bg-feira-borda dark:bg-feira-bordaDark text-feira-primary dark:text-white hover:brightness-95',
  danger: 'bg-feira-saida text-white hover:brightness-110 active:scale-[0.98]',
  success: 'bg-feira-entrada text-white hover:brightness-110 active:scale-[0.98]',
  ghost: 'bg-transparent text-feira-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-5 py-3.5 rounded-xl gap-2'
};

export default function Button({
  variant = 'primary', size = 'md', icon, fullWidth, className = '', children, ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150
        disabled:opacity-50 disabled:pointer-events-none select-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
