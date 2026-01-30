export type PapelUsuario = "admin" | "secretaria" | "tesoureiro" | "conselheiro";

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  papel: PapelUsuario;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  nome: string;
  papel: PapelUsuario;
}
