// Tipos centrais do sistema. Mantidos em um único arquivo para facilitar
// a evolução do schema (ex.: quando migrar para sincronização em nuvem).

export type CategoriaEntrada =
  | 'Coco' | 'Banana' | 'Manga' | 'Limão' | 'Tomate' | 'Outros' | string;

export type CategoriaSaida =
  | 'Compra de mercadorias' | 'Combustível' | 'Alimentação' | 'Frete'
  | 'Manutenção' | 'Feira' | 'Outros' | string;

export type OrigemLancamento = 'manual' | 'venda' | 'compra';

export interface Entrada {
  id: string;
  valor: number;
  data: string;     // YYYY-MM-DD
  hora: string;      // HH:mm
  categoria: CategoriaEntrada;
  observacao?: string;
  origem: OrigemLancamento;
  vendaId?: string;
  createdAt: number;
}

export interface Saida {
  id: string;
  valor: number;
  data: string;
  hora: string;
  categoria: CategoriaSaida;
  observacao?: string;
  origem: OrigemLancamento;
  compraId?: string;
  createdAt: number;
}

export interface Fornecedor {
  id: string;
  nome: string;
  contato?: string;
  observacao?: string;
  createdAt: number;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  unidade: 'kg' | 'unidade' | 'caixa' | 'saco' | 'dúzia' | 'litro';
  quantidade: number;        // quantidade atual em estoque
  quantidadeMinima: number;
  precoCompra: number;       // custo médio ponderado
  precoVenda: number;
  fornecedorId?: string;
  ultimaMovimentacao?: number; // timestamp
  createdAt: number;
}

export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste';

export interface MovimentacaoEstoque {
  id: string;
  produtoId: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  motivo: string; // 'Compra', 'Venda', 'Ajuste manual', etc.
  observacao?: string;
  data: string;
  hora: string;
  createdAt: number;
}

export interface Compra {
  id: string;
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  fornecedorId?: string;
  data: string;
  hora: string;
  observacao?: string;
  saidaId: string;
  createdAt: number;
}

export interface Venda {
  id: string;
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  custoUnitario: number;
  total: number;
  lucro: number;
  data: string;
  hora: string;
  observacao?: string;
  entradaId: string;
  createdAt: number;
}

export interface Settings {
  id: 'app';
  theme: 'light' | 'dark';
  caixaInicial: number;
  categoriasEntrada: string[];
  categoriasSaida: string[];
}

// Tipo unificado usado na tela de Histórico para listar tudo junto.
export interface MovimentoHistorico {
  id: string;
  tipo: 'Entrada' | 'Saída' | 'Compra' | 'Venda' | 'Estoque';
  data: string;
  hora: string;
  descricao: string;
  valor: number;
  cor: 'entrada' | 'saida' | 'info';
  refId: string;
}
