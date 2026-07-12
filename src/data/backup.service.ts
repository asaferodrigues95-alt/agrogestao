import { db } from './local-database';

// Estrutura do arquivo de backup. Versão incluída para permitir migrações futuras.
interface BackupData {
  versao: number;
  exportadoEm: string;
  entradas: unknown[];
  saidas: unknown[];
  produtos: unknown[];
  fornecedores: unknown[];
  movimentacoes: unknown[];
  compras: unknown[];
  vendas: unknown[];
  settings: unknown[];
}

export async function exportarBackup(): Promise<void> {
  const data: BackupData = {
    versao: 1,
    exportadoEm: new Date().toISOString(),
    entradas: await db.entradas.toArray(),
    saidas: await db.saidas.toArray(),
    produtos: await db.produtos.toArray(),
    fornecedores: await db.fornecedores.toArray(),
    movimentacoes: await db.movimentacoes.toArray(),
    compras: await db.compras.toArray(),
    vendas: await db.vendas.toArray(),
    settings: await db.settings.toArray()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dataStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'backup-feira-forte-' + dataStr + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Restaura o backup substituindo TODOS os dados atuais (usuário deve confirmar antes).
export async function importarBackup(arquivo: File): Promise<void> {
  const texto = await arquivo.text();
  const data = JSON.parse(texto) as BackupData;

  if (!data || typeof data !== 'object' || !('versao' in data)) {
    throw new Error('Arquivo de backup inválido.');
  }

  await db.transaction('rw', [db.entradas, db.saidas, db.produtos, db.fornecedores,
    db.movimentacoes, db.compras, db.vendas, db.settings], async () => {
      await Promise.all([
        db.entradas.clear(), db.saidas.clear(), db.produtos.clear(), db.fornecedores.clear(),
        db.movimentacoes.clear(), db.compras.clear(), db.vendas.clear(), db.settings.clear()
      ]);
      await Promise.all([
        db.entradas.bulkAdd(data.entradas as any[]),
        db.saidas.bulkAdd(data.saidas as any[]),
        db.produtos.bulkAdd(data.produtos as any[]),
        db.fornecedores.bulkAdd(data.fornecedores as any[]),
        db.movimentacoes.bulkAdd(data.movimentacoes as any[]),
        db.compras.bulkAdd(data.compras as any[]),
        db.vendas.bulkAdd(data.vendas as any[]),
        db.settings.bulkAdd(data.settings as any[])
      ]);
    });
}

export async function limparTodosDados(): Promise<void> {
  await db.transaction('rw', [db.entradas, db.saidas, db.produtos, db.fornecedores,
    db.movimentacoes, db.compras, db.vendas], async () => {
      await Promise.all([
        db.entradas.clear(), db.saidas.clear(), db.produtos.clear(), db.fornecedores.clear(),
        db.movimentacoes.clear(), db.compras.clear(), db.vendas.clear()
      ]);
    });
}
