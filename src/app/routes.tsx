import type { ComponentType } from 'react';
import Dashboard from '@features/dashboard/Dashboard.page';
import Financeiro from '@features/financeiro/Financeiro.page';
import Estoque from '@features/estoque/Estoque.page';
import Historico from '@features/historico/Historico.page';
import Relatorios from '@features/relatorios/Relatorios.page';
import Config from '@features/config/Config.page';
import { NAV_ITEMS, CONFIG_NAV_ITEM } from '@shared/layout/nav-items';

// "app" é a camada de composição: é o único lugar do projeto que conhece,
// ao mesmo tempo, os metadados de navegação (shared) E as páginas (features).
// Isso mantém a direção de dependência correta: shared/features nunca importam de app/.
const PAGE_BY_PATH: Record<string, ComponentType> = {
  '/': Dashboard,
  '/financeiro': Financeiro,
  '/estoque': Estoque,
  '/historico': Historico,
  '/relatorios': Relatorios,
  '/config': Config
};

export const routes = [...NAV_ITEMS, CONFIG_NAV_ITEM].map(item => ({
  ...item,
  Component: PAGE_BY_PATH[item.path]
}));
