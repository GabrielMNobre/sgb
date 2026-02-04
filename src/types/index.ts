export * from "./auth";
export * from "./database";
export * from "./unidade";
export * from "./membro";

export type TipoClasse = "desbravador" | "lideranca";
export type StatusEncontro = "agendado" | "em_andamento" | "finalizado";
export type StatusPresenca = "pontual" | "atrasado" | "falta" | "falta_justificada";
export type StatusMensalidade = "pendente" | "pago";

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
