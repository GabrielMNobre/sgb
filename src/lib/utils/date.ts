import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(
  date: string | Date,
  pattern = "dd/MM/yyyy"
): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, pattern, { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

export function formatDateLong(date: string | Date): string {
  return formatDate(date, "dd 'de' MMMM 'de' yyyy");
}
