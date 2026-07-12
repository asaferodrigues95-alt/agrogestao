import { db } from '../local-database';
import type { Settings } from '../../core/entities';

const DEFAULT_CATEGORIAS_ENTRADA = ['Coco', 'Banana', 'Manga', 'Limão', 'Tomate', 'Outros'];
const DEFAULT_CATEGORIAS_SAIDA = ['Compra de mercadorias', 'Combustível', 'Alimentação', 'Frete', 'Manutenção', 'Feira', 'Outros'];

// Garante que exista sempre um registro de configurações padrão (idempotente).
export async function ensureSettings(): Promise<Settings> {
  let settings = await db.settings.get('app');
  if (!settings) {
    settings = {
      id: 'app',
      theme: 'light',
      caixaInicial: 0,
      categoriasEntrada: DEFAULT_CATEGORIAS_ENTRADA,
      categoriasSaida: DEFAULT_CATEGORIAS_SAIDA
    };
    await db.settings.put(settings);
  }
  return settings;
}

export const updateSettings = (changes: Partial<Settings>) => db.settings.update('app', changes);
