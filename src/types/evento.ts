export interface Evento {
  id: string;
  nome: string;
  descricao?: string;
  data?: Date;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface EventoComGastos extends Evento {
  totalGasto: number;
  quantidadeGastos: number;
}

export interface EventoFormData {
  nome: string;
  descricao?: string;
  data?: string;
  ativo: boolean;
}
