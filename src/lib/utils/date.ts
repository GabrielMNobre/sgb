import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Parses a date string safely.
 * Date-only strings (YYYY-MM-DD) are parsed as local time
 * to avoid the UTC timezone offset causing -1 day in Brazil (UTC-3).
 */
function parseDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(date);
}

export function formatDate(
  date: string | Date | undefined | null,
  pattern = "dd/MM/yyyy"
): string {
  if (!date) return "—";
  const parsedDate = parseDate(date);
  if (isNaN(parsedDate.getTime())) return "—";
  return format(parsedDate, pattern, { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

export function formatDateLong(date: string | Date): string {
  return formatDate(date, "dd 'de' MMMM 'de' yyyy");
}
