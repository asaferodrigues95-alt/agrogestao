import Dexie, { type Table } from 'dexie';
import type {
  Entrada, Saida, Produto, Fornecedor, MovimentacaoEstoque,
  Compra, Venda, Settings
} from '../core/entities';

// Dexie é uma camada de abstração sobre o IndexedDB nativo do navegador.
// Todos os dados ficam 100% no dispositivo do usuário — nada trafega pela rede.
// Esta classe tem UMA responsabilidade: definir o schema do banco local.
// Regras de negócio (o que fazer com os dados) vivem nos repositórios em data/repositories/.
//
// Preparado para futura sincronização em nuvem: basta, no futuro, adicionar uma
// tabela "syncQueue" e campos "updatedAt"/"remoteId" em cada entidade, sem
// precisar alterar a forma como as telas consultam os dados (useLiveQuery).
export class FeiraDB extends Dexie {
  entradas!: Table<Entrada, string>;
  saidas!: Table<Saida, string>;
  produtos!: Table<Produto, string>;
  fornecedores!: Table<Fornecedor, string>;
  movimentacoes!: Table<MovimentacaoEstoque, string>;
  compras!: Table<Compra, string>;
  vendas!: Table<Venda, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('agrogestao-db');
    this.version(1).stores({
      entradas: 'id, data, categoria, origem, createdAt',
      saidas: 'id, data, categoria, origem, createdAt',
      produtos: 'id, nome, categoria, quantidade',
      fornecedores: 'id, nome',
      movimentacoes: 'id, produtoId, tipo, data, createdAt',
      compras: 'id, produtoId, data, createdAt',
      vendas: 'id, produtoId, data, createdAt',
      settings: 'id'
    });
  }
}

export const db = new FeiraDB();
