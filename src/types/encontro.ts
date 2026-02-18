// ========== Status Enums ==========

export type StatusEncontro = "agendado" | "em_andamento" | "finalizado";
export type StatusPresenca = "pontual" | "atrasado" | "falta" | "falta_justificada";

// ========== Encontro ==========

export interface Encontro {
  id: string;
  data: string;
  descricao?: string;
  status: StatusEncontro;
  criadoPor?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface EncontroFormData {
  data: string;
  descricao?: string;
}

export interface FiltrosEncontro {
  status?: StatusEncontro;
  dataInicio?: string;
  dataFim?: string;
}

export interface EncontroComResumo extends Encontro {
  totalMembros: number;
  totalPresentes: number;
}

// ========== Presença ==========

export interface Presenca {
  id: string;
  encontroId: string;
  membroId: string;
  status: StatusPresenca;
  temMaterial: boolean;
  temUniforme: boolean;
  observacao?: string;
  registradoPor?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PresencaComMembro {
  id?: string;
  encontroId: string;
  membroId: string;
  status: StatusPresenca;
  temMaterial: boolean;
  temUniforme: boolean;
  observacao?: string;
  membro: {
    id: string;
    nome: string;
    tipo: string;
    classe?: {
      id: string;
      nome: string;
    };
    unidade?: {
      id: string;
      nome: string;
    };
  };
}

export interface PresencaFormItem {
  membroId: string;
  status: StatusPresenca;
  temMaterial: boolean;
  temUniforme: boolean;
  observacao?: string;
}

// ========== Resumos ==========

export interface ResumoPresencaEncontro {
  totalMembros: number;
  totalPresentes: number;
  totalPontuais: number;
  totalAtrasados: number;
  totalFaltas: number;
  totalFaltasJustificadas: number;
  totalComMaterial: number;
  totalComUniforme: number;
}

export interface ResumoPresencaUnidade {
  unidadeId: string;
  unidadeNome: string;
  corPrimaria: string;
  corSecundaria: string;
  totalMembros: number;
  totalPresentes: number;
  totalFaltas: number;
  percentualPresenca: number;
  chamadaRealizada: boolean;
}

export interface ResumoDiretoria {
  totalMembros: number;
  totalPresentes: number;
  percentualPresenca: number;
  chamadaRealizada: boolean;
}
