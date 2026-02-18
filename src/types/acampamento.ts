export type StatusAcampamento = "aberto" | "finalizado";
export type StatusParticipante = "inscrito" | "cancelado";

// ========== Acampamento ==========

export interface Acampamento {
  id: string;
  nome: string;
  descricao?: string;
  dataInicio: Date;
  dataFim: Date;
  valorPorPessoa: number;
  eventoId: string;
  status: StatusAcampamento;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface AcampamentoFormData {
  nome: string;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
  valorPorPessoa: number;
}

export interface FiltrosAcampamento {
  status?: StatusAcampamento;
  ano?: number;
}

// ========== Participante ==========

export interface ParticipanteAcampamento {
  id: string;
  acampamentoId: string;
  membroId: string;
  valorAPagar: number;
  isento: boolean;
  motivoIsencao?: string;
  autorizacaoRecolhida: boolean;
  status: StatusParticipante;
  dataCancelamento?: Date;
  valorDevolvido?: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ParticipanteComMembro extends ParticipanteAcampamento {
  membro?: {
    id: string;
    nome: string;
    dataNascimento?: Date;
    tipo: string;
    unidade?: {
      id: string;
      nome: string;
    };
  };
}

export interface ParticipanteComPagamentos extends ParticipanteComMembro {
  totalPago: number;
  pendente: number;
}

export interface ParticipanteFormData {
  membroId: string;
  isento: boolean;
  motivoIsencao?: string;
  valorAPagar: number;
}

export interface FiltrosParticipante {
  status?: StatusParticipante;
  situacaoPagamento?: "em_dia" | "pendente" | "sem_pagamento";
  autorizacao?: "pendente" | "recolhida";
  busca?: string;
}

// ========== Pagamento ==========

export interface PagamentoAcampamento {
  id: string;
  participanteId: string;
  data: Date;
  valor: number;
  observacao?: string;
  registradoPor?: string;
  criadoEm: Date;
}

export interface PagamentoComParticipante extends PagamentoAcampamento {
  participante?: {
    id: string;
    membro?: {
      id: string;
      nome: string;
    };
  };
}

export interface PagamentoFormData {
  participanteId?: string;
  data: string;
  valor: number;
  observacao?: string;
}

export interface FiltrosPagamento {
  dataInicio?: string;
  dataFim?: string;
  participanteId?: string;
}

// ========== Dashboard ==========

export interface ResumoAcampamento {
  totalParticipantes: number;
  totalIsentos: number;
  autorizacoesPendentes: number;
  valorEsperado: number;
  totalArrecadado: number;
  totalPendente: number;
  percentualArrecadado: number;
  totalGastos: number;
  saldo: number;
}
