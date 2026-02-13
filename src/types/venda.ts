export interface CategoriaVenda {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CategoriaVendaFormData {
  nome: string;
  descricao?: string;
}

export interface Venda {
  id: string;
  categoriaId?: string;
  data: Date;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacao?: string;
  registradoPor?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface VendaComCategoria extends Venda {
  categoria?: CategoriaVenda | null;
}

export interface VendaFormData {
  categoriaId?: string;
  data: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  observacao?: string;
}

export interface FiltrosVenda {
  categoriaId?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}
