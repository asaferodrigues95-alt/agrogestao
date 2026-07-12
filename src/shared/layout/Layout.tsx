import { NavLink, Outlet } from 'react-router-dom';
import { NAV_ITEMS, CONFIG_NAV_ITEM } from './nav-items';

export default function Layout() {
  return (
    <div className="min-h-screen bg-feira-bg dark:bg-feira-bgDark text-feira-primary dark:text-white">
      <div className="flex">
        {/* Navegação lateral — visível apenas no desktop (md+) */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 min-h-screen border-r border-feira-borda dark:border-feira-bordaDark px-4 py-6 gap-1">
          <div className="px-2 mb-6">
            <p className="font-display font-semibold text-lg leading-tight">AgroGestão</p>
            <p className="text-xs text-neutral-400 -mt-0.5">Financeiro · Estoque · Vendas</p>
          </div>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                ${isActive ? 'bg-feira-primary text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'}`}>
              <item.Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          <div className="mt-auto">
            <NavLink to={CONFIG_NAV_ITEM.path}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                ${isActive ? 'bg-feira-primary text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300'}`}>
              <CONFIG_NAV_ITEM.Icon className="w-5 h-5" />
              {CONFIG_NAV_ITEM.label}
            </NavLink>
          </div>
        </aside>

        <main className="flex-1 min-w-0 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Navegação inferior — visível apenas no mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-feira-surface/95 dark:bg-feira-surfaceDark/95 backdrop-blur
        border-t border-feira-borda dark:border-feira-bordaDark grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium
              ${isActive ? 'text-feira-primary dark:text-feira-accent' : 'text-neutral-400'}`}>
            <item.Icon className="w-[22px] h-[22px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
