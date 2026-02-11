import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type {
  Gasto,
  GastoComEvento,
  GastoFormData,
  FiltrosGasto,
  TotalGastosPeriodo,
} from "@/types/gasto";

// ========== CRUD Operations ==========

export async function getGastos(
  filtros?: FiltrosGasto
): Promise<GastoComEvento[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("gastos")
    .select(`
      *,
      eventos (
        id,
        nome,
        data
      )
    `)
    .order("data", { ascending: false });

  // Aplicar filtros
  if (filtros?.eventoId) {
    query = query.eq("evento_id", filtros.eventoId);
  }

  if (filtros?.dataInicio) {
    query = query.gte("data", filtros.dataInicio);
  }

  if (filtros?.dataFim) {
    query = query.lte("data", filtros.dataFim);
  }

  if (filtros?.busca) {
    query = query.or(
      `descricao.ilike.%${filtros.busca}%,observacao.ilike.%${filtros.busca}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar gastos:", error);
    throw new Error("Erro ao buscar gastos");
  }

  return data.map((gasto: any) => {
    const { eventos, ...gastoData } = gasto;
    return {
      ...snakeToCamel<Gasto>(gastoData),
      evento: eventos ? snakeToCamel(eventos) : null,
    };
  });
}

export async function getGastoById(id: string): Promise<GastoComEvento | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("gastos")
    .select(`
      *,
      eventos (
        id,
        nome,
        data
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar gasto:", error);
    throw new Error("Erro ao buscar gasto");
  }

  const { eventos, ...gastoData } = data;
  return {
    ...snakeToCamel<Gasto>(gastoData),
    evento: eventos ? snakeToCamel(eventos) : null,
  };
}

export async function getGastosPorEvento(
  eventoId: string
): Promise<GastoComEvento[]> {
  return getGastos({ eventoId });
}

export async function getUltimosGastos(
  limite: number = 5
): Promise<GastoComEvento[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("gastos")
    .select(`
      *,
      eventos (
        id,
        nome,
        data
      )
    `)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) {
    console.error("Erro ao buscar últimos gastos:", error);
    throw new Error("Erro ao buscar últimos gastos");
  }

  return data.map((gasto: any) => {
    const { eventos, ...gastoData } = gasto;
    return {
      ...snakeToCamel<Gasto>(gastoData),
      evento: eventos ? snakeToCamel(eventos) : null,
    };
  });
}

export async function createGasto(
  data: GastoFormData,
  usuarioId: string
): Promise<Gasto> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const gastoData = {
    ...(camelToSnake(data) as Record<string, unknown>),
    registrado_por: usuarioId,
  };

  const { data: gasto, error } = await db
    .from("gastos")
    .insert(gastoData)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar gasto:", error);
    throw new Error("Erro ao criar gasto");
  }

  return snakeToCamel<Gasto>(gasto);
}

export async function updateGasto(
  id: string,
  data: Partial<GastoFormData>
): Promise<Gasto> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: gasto, error } = await db
    .from("gastos")
    .update(camelToSnake(data))
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar gasto:", error);
    throw new Error("Erro ao atualizar gasto");
  }

  return snakeToCamel<Gasto>(gasto);
}

export async function deleteGasto(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("gastos").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir gasto:", error);
    throw new Error("Erro ao excluir gasto");
  }
}

// ========== Cálculos e Totalizações ==========

export async function calcularTotalPorEvento(eventoId: string): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("gastos")
    .select("valor")
    .eq("evento_id", eventoId);

  if (error) {
    console.error("Erro ao calcular total por evento:", error);
    throw new Error("Erro ao calcular total por evento");
  }

  return data.reduce((sum: number, gasto: any) => sum + (gasto.valor || 0), 0);
}

export async function calcularTotalPorPeriodo(
  dataInicio: string,
  dataFim: string
): Promise<TotalGastosPeriodo> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("gastos")
    .select("valor")
    .gte("data", dataInicio)
    .lte("data", dataFim);

  if (error) {
    console.error("Erro ao calcular total por período:", error);
    throw new Error("Erro ao calcular total por período");
  }

  const total = data.reduce((sum: number, gasto: any) => sum + (gasto.valor || 0), 0);

  return {
    total,
    quantidade: data.length,
    dataInicio: new Date(dataInicio),
    dataFim: new Date(dataFim),
  };
}

export async function calcularTotalMesAtual(): Promise<number> {
  const agora = new Date();
  const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

  const dataInicio = primeiroDia.toISOString().split("T")[0];
  const dataFim = ultimoDia.toISOString().split("T")[0];

  const resultado = await calcularTotalPorPeriodo(dataInicio, dataFim);
  return resultado.total;
}
