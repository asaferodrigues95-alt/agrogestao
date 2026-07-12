import type { HTMLAttributes } from 'react';

export default function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-feira-surface dark:bg-feira-surfaceDark rounded-2xl shadow-card border border-feira-borda dark:border-feira-bordaDark ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
