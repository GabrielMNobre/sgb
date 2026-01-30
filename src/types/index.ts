export * from "./auth";
export * from "./database";

export type TipoMembro = "desbravador" | "diretoria";
export type TipoClasse = "desbravador" | "diretoria";
export type StatusEncontro = "agendado" | "em_andamento" | "finalizado";
export type StatusPresenca = "pontual" | "atrasado" | "falta" | "falta_justificada";
export type StatusMensalidade = "pendente" | "pago";

export interface Unidade {
  id: string;
  nome: string;
  descricao?: string;
  corPrimaria: string;
  corSecundaria: string;
  ativa: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Membro {
  id: string;
  nome: string;
  dataNascimento?: Date;
  tipo: TipoMembro;
  unidadeId?: string;
  classeId?: string;
  telefone?: string;
  responsavel?: string;
  telefoneResponsavel?: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Encontro {
  id: string;
  data: Date;
  descricao?: string;
  status: StatusEncontro;
  criadoPor?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Presenca {
  id: string;
  encontroId: string;
  membroId: string;
  status: StatusPresenca;
  temMaterial: boolean;
  temUniforme: boolean;
  observacao?: string;
  registradoPor?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
