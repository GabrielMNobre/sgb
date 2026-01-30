export const APP_NAME = "SGB";
export const APP_FULL_NAME = "Sistema de Gestão do Borba";
export const CLUB_NAME = "Clube de Desbravadores Borba Gato";
export const CLUB_CHURCH = "IASD Santo Amaro";
export const CLUB_YEAR = 1965;

export const ROLES = {
  ADMIN: "admin",
  SECRETARIA: "secretaria",
  TESOUREIRO: "tesoureiro",
  CONSELHEIRO: "conselheiro",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  secretaria: "Secretaria",
  tesoureiro: "Tesoureiro",
  conselheiro: "Conselheiro",
};

export const PRESENCE_STATUS = {
  PONTUAL: "pontual",
  ATRASADO: "atrasado",
  FALTA: "falta",
  FALTA_JUSTIFICADA: "falta_justificada",
} as const;

export const PRESENCE_LABELS: Record<string, string> = {
  pontual: "Pontual",
  atrasado: "Atrasado",
  falta: "Falta",
  falta_justificada: "Falta Justificada",
};

export const MEETING_STATUS = {
  AGENDADO: "agendado",
  EM_ANDAMENTO: "em_andamento",
  FINALIZADO: "finalizado",
} as const;

export const MEETING_LABELS: Record<string, string> = {
  agendado: "Agendado",
  em_andamento: "Em Andamento",
  finalizado: "Finalizado",
};
