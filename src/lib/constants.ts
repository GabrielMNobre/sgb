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

// Financial Constants
export const MENSALIDADE_DESBRAVADOR = 30;
export const MENSALIDADE_DIRETORIA = 50;
export const META_PERCENTUAL = 0.80; // 80%

export const MESES_LABELS: Record<number, string> = {
  1: "Janeiro",
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",
  10: "Outubro",
  11: "Novembro",
  12: "Dezembro",
};

export const MESES_ABREVIADOS: Record<number, string> = {
  1: "Jan",
  2: "Fev",
  3: "Mar",
  4: "Abr",
  5: "Mai",
  6: "Jun",
  7: "Jul",
  8: "Ago",
  9: "Set",
  10: "Out",
  11: "Nov",
  12: "Dez",
};

export const STATUS_MENSALIDADE_LABELS: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
};
