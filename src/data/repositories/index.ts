// Ponto único de acesso à camada de dados (Data Layer).
// As features nunca importam diretamente de "local-database" ou de um
// repositório específico por caminho profundo — sempre importam daqui.
export * from './entradas.repository';
export * from './saidas.repository';
export * from './fornecedores.repository';
export * from './produtos.repository';
export * from './estoque.repository';
export * from './compras.repository';
export * from './vendas.repository';
export * from './settings.repository';
export { db } from '../local-database';
