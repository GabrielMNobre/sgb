import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type { Evento, EventoComGastos, EventoFormData } from "@/types/evento";

// ========== CRUD Operations ==========

export async function getEventos(apenasAtivos = false): Promise<Evento[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("eventos")
    .select("*")
    .order("data", { ascending: false, nullsFirst: false })
    .order("criado_em", { ascending: false });

  if (apenasAtivos) {
    query = query.eq("ativo", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar eventos:", error);
    throw new Error("Erro ao buscar eventos");
  }

  return data.map((evento: any) => snakeToCamel<Evento>(evento));
}

export async function getEventoById(id: string): Promise<Evento | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar evento:", error);
    throw new Error("Erro ao buscar evento");
  }

  return snakeToCamel<Evento>(data);
}

export async function getEventosComGastos(): Promise<EventoComGastos[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("eventos")
    .select(`
      *,
      gastos (
        id,
        valor
      )
    `)
    .order("data", { ascending: false, nullsFirst: false })
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar eventos com gastos:", error);
    throw new Error("Erro ao buscar eventos com gastos");
  }

  return data.map((evento: any) => {
    const gastos = evento.gastos || [];
    const totalGasto = gastos.reduce((sum: number, g: any) => sum + (g.valor || 0), 0);
    const quantidadeGastos = gastos.length;

    const { gastos: _, ...eventoSemGastos } = evento;

    return {
      ...snakeToCamel<Evento>(eventoSemGastos),
      totalGasto,
      quantidadeGastos,
    };
  });
}

export async function createEvento(
  data: EventoFormData,
  usuarioId: string
): Promise<Evento> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const eventoData = {
    ...(camelToSnake(data) as Record<string, unknown>),
    criado_por: usuarioId,
  };

  const { data: evento, error } = await db
    .from("eventos")
    .insert(eventoData)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar evento:", error);
    throw new Error("Erro ao criar evento");
  }

  return snakeToCamel<Evento>(evento);
}

export async function updateEvento(
  id: string,
  data: Partial<EventoFormData>
): Promise<Evento> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: evento, error } = await db
    .from("eventos")
    .update(camelToSnake(data))
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar evento:", error);
    throw new Error("Erro ao atualizar evento");
  }

  return snakeToCamel<Evento>(evento);
}

export async function toggleEventoAtivo(id: string): Promise<Evento> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Buscar estado atual
  const { data: eventoAtual, error: fetchError } = await db
    .from("eventos")
    .select("ativo")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Erro ao buscar evento:", fetchError);
    throw new Error("Erro ao buscar evento");
  }

  // Inverter o estado
  const { data: evento, error } = await db
    .from("eventos")
    .update({ ativo: !eventoAtual.ativo })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar evento:", error);
    throw new Error("Erro ao atualizar evento");
  }

  return snakeToCamel<Evento>(evento);
}

export async function deleteEvento(id: string): Promise<void> {
  const supabase = await createClient();

  // Verificar se há gastos vinculados
  const { data: gastos } = await supabase
    .from("gastos")
    .select("id")
    .eq("evento_id", id)
    .limit(1);

  if (gastos && gastos.length > 0) {
    throw new Error("Não é possível excluir um evento com gastos vinculados");
  }

  const { error } = await supabase
    .from("eventos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir evento:", error);
    throw new Error("Erro ao excluir evento");
  }
}
