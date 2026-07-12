import type { ComponentType } from 'react';
import { Home, Wallet, Boxes, History, BarChart, Settings as SettingsIcon } from '../ui/icons';

export interface NavItem {
  path: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  /** Match exato de rota (usado pelo NavLink do react-router). */
  end?: boolean;
}

// Fonte única dos itens de navegação principal (lateral no desktop, inferior no mobile).
// Fica em "shared" (não em "app") de propósito: o Layout não deve depender da camada de
// composição da aplicação — apenas de dados de navegação puros, sem referência às páginas.
export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Início', Icon: Home, end: true },
  { path: '/financeiro', label: 'Financeiro', Icon: Wallet },
  { path: '/estoque', label: 'Estoque', Icon: Boxes },
  { path: '/historico', label: 'Histórico', Icon: History },
  { path: '/relatorios', label: 'Relatórios', Icon: BarChart }
];

export const CONFIG_NAV_ITEM: NavItem = { path: '/config', label: 'Ajustes e backup', Icon: SettingsIcon };
