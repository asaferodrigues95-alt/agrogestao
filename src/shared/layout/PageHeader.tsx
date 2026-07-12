import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon } from '../ui/icons';

export default function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-feira-bg/90 dark:bg-feira-bgDark/90 backdrop-blur px-4 md:px-8 pt-6 pb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="font-display font-semibold text-2xl md:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {action}
        <Link to="/config" className="md:hidden p-2.5 rounded-xl bg-feira-surface dark:bg-feira-surfaceDark border border-feira-borda dark:border-feira-bordaDark">
          <SettingsIcon className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
