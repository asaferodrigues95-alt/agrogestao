import { v4 as uuid } from 'uuid';
import { db } from '../local-database';
import { now } from '../../shared/utils/datetime';
import type { Fornecedor } from '../../core/entities';

export async function addFornecedor(input: Omit<Fornecedor, 'id' | 'createdAt'>) {
  const fornecedor: Fornecedor = { ...input, id: uuid(), createdAt: now() };
  await db.fornecedores.add(fornecedor);
  return fornecedor;
}

export const updateFornecedor = (id: string, changes: Partial<Fornecedor>) => db.fornecedores.update(id, changes);

export const deleteFornecedor = (id: string) => db.fornecedores.delete(id);
