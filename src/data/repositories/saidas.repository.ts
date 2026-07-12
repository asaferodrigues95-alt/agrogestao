import { v4 as uuid } from 'uuid';
import { db } from '../local-database';
import { now } from '../../shared/utils/datetime';
import type { Saida } from '../../core/entities';

export async function addSaida(input: Omit<Saida, 'id' | 'createdAt' | 'origem'>) {
  const saida: Saida = { ...input, id: uuid(), origem: 'manual', createdAt: now() };
  await db.saidas.add(saida);
  return saida;
}

export const updateSaida = (id: string, changes: Partial<Saida>) => db.saidas.update(id, changes);

export const deleteSaida = (id: string) => db.saidas.delete(id);
