import { v4 as uuid } from 'uuid';
import { db } from '../local-database';
import { now } from '../../shared/utils/datetime';
import type { Entrada } from '../../core/entities';

export async function addEntrada(input: Omit<Entrada, 'id' | 'createdAt' | 'origem'>) {
  const entrada: Entrada = { ...input, id: uuid(), origem: 'manual', createdAt: now() };
  await db.entradas.add(entrada);
  return entrada;
}

export const updateEntrada = (id: string, changes: Partial<Entrada>) => db.entradas.update(id, changes);

export const deleteEntrada = (id: string) => db.entradas.delete(id);
