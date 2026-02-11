export interface Gasto {
  id: string;
  eventoId: string;
  data: Date;
  descricao: string;
  valor: number;
  observacao?: string;
  registradoPor?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface GastoComEvento extends Gasto {
  evento?: {
    id: string;
    nome: string;
    data?: Date;
  } | null;
}

export interface GastoFormData {
  eventoId: string;
  data: string;
  descricao: string;
  valor: number;
  observacao?: string;
}

export interface FiltrosGasto {
  eventoId?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}

export interface TotalGastosPeriodo {
  total: number;
  quantidade: number;
  dataInicio: Date;
  dataFim: Date;
}
