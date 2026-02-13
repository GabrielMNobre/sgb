export interface Doacao {
  id: string;
  data: Date;
  valor: number;
  doador?: string;
  observacao?: string;
  registradoPor?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface DoacaoFormData {
  data: string;
  valor: number;
  doador?: string;
  observacao?: string;
}

export interface FiltrosDoacao {
  dataInicio?: string;
  dataFim?: string;
  doador?: string;
}
