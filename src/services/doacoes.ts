import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type {
  Doacao,
  DoacaoFormData,
  FiltrosDoacao,
} from "@/types/doacao";

// ========== CRUD Doações ==========

export async function getDoacoes(
  filtros?: FiltrosDoacao
): Promise<Doacao[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db.from("doacoes").select("*");

  // Apply filters
  if (filtros?.dataInicio) {
    query = query.gte("data", filtros.dataInicio);
  }

  if (filtros?.dataFim) {
    query = query.lte("data", filtros.dataFim);
  }

  if (filtros?.doador) {
    query = query.ilike("doador", `%${filtros.doador}%`);
  }

  query = query.order("data", { ascending: false }).order("criado_em", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar doações:", error);
    throw new Error("Erro ao buscar doações");
  }

  return (data || []).map((item: any) => snakeToCamel<Doacao>(item));
}

export async function getDoacaoById(id: string): Promise<Doacao | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("doacoes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar doação:", error);
    throw new Error("Erro ao buscar doação");
  }

  return snakeToCamel<Doacao>(data);
}

export async function createDoacao(
  formData: DoacaoFormData,
  usuarioId: string
): Promise<Doacao> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToInsert = camelToSnake({
    data: formData.data,
    valor: formData.valor,
    doador: formData.doador || null,
    observacao: formData.observacao || null,
    registradoPor: usuarioId,
  });

  const { data, error } = await db
    .from("doacoes")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar doação:", error);
    throw new Error("Erro ao criar doação");
  }

  return snakeToCamel<Doacao>(data);
}

export async function updateDoacao(
  id: string,
  formData: DoacaoFormData
): Promise<Doacao> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToUpdate = camelToSnake({
    data: formData.data,
    valor: formData.valor,
    doador: formData.doador || null,
    observacao: formData.observacao || null,
    atualizadoEm: new Date().toISOString(),
  });

  const { data, error } = await db
    .from("doacoes")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar doação:", error);
    throw new Error("Erro ao atualizar doação");
  }

  return snakeToCamel<Doacao>(data);
}

export async function deleteDoacao(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db.from("doacoes").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir doação:", error);
    throw new Error("Erro ao excluir doação");
  }
}

// ========== Analytics ==========

export async function calcularTotalMesAtual(): Promise<{ total: number; quantidade: number }> {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const dataInicio = `${anoAtual}-${String(mesAtual).padStart(2, "0")}-01`;
  const dataFim = new Date(anoAtual, mesAtual, 0).toISOString().split("T")[0];

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("doacoes")
    .select("valor")
    .gte("data", dataInicio)
    .lte("data", dataFim);

  if (error) {
    console.error("Erro ao calcular total de doações:", error);
    return { total: 0, quantidade: 0 };
  }

  const doacoes = data || [];
  return {
    total: doacoes.reduce((sum: number, item: any) => sum + (item.valor || 0), 0),
    quantidade: doacoes.length,
  };
}

export async function calcularTotalPorPeriodo(
  dataInicio: string,
  dataFim: string
): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("doacoes")
    .select("valor")
    .gte("data", dataInicio)
    .lte("data", dataFim);

  if (error) {
    console.error("Erro ao calcular total:", error);
    return 0;
  }

  return (data || []).reduce((sum: number, item: any) => sum + (item.valor || 0), 0);
}

export async function obterDoacoesUltimas(
  limite: number = 5
): Promise<Doacao[]> {
  const doacoes = await getDoacoes();
  return doacoes.slice(0, limite);
}

export async function obterTop10Doadores(
  ano?: number
): Promise<Array<{ doador: string; totalDoado: number; quantidadeDoacoes: number }>> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("doacoes")
    .select("doador, valor");

  // Filter by year if provided
  if (ano) {
    const dataInicio = `${ano}-01-01`;
    const dataFim = `${ano}-12-31`;
    query = query.gte("data", dataInicio).lte("data", dataFim);
  }

  // Only include donations with donor name
  query = query.not("doador", "is", null);

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar top doadores:", error);
    return [];
  }

  // Group by donor name and calculate totals
  const doadorMap = new Map<string, { total: number; count: number }>();

  (data || []).forEach((item: any) => {
    const doador = item.doador;
    const valor = item.valor || 0;

    if (doador) {
      const current = doadorMap.get(doador) || { total: 0, count: 0 };
      doadorMap.set(doador, {
        total: current.total + valor,
        count: current.count + 1,
      });
    }
  });

  // Convert to array and sort by total
  return Array.from(doadorMap.entries())
    .map(([doador, stats]) => ({
      doador,
      totalDoado: stats.total,
      quantidadeDoacoes: stats.count,
    }))
    .sort((a, b) => b.totalDoado - a.totalDoado)
    .slice(0, 10);
}

export async function obterDoacoesPorMes(
  meses: number = 6
): Promise<Array<{ mes: string; total: number; quantidade: number }>> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const hoje = new Date();
  const dataFim = hoje.toISOString().split("T")[0];

  // Calculate start date (N months ago)
  const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - meses + 1, 1)
    .toISOString()
    .split("T")[0];

  const { data, error } = await db
    .from("doacoes")
    .select("data, valor")
    .gte("data", dataInicio)
    .lte("data", dataFim)
    .order("data", { ascending: true });

  if (error) {
    console.error("Erro ao buscar doações por mês:", error);
    return [];
  }

  // Group by month
  const mesMapa = new Map<string, { total: number; count: number }>();

  (data || []).forEach((item: any) => {
    const dataDoacao = new Date(item.data);
    const mesAno = `${dataDoacao.getFullYear()}-${String(dataDoacao.getMonth() + 1).padStart(2, "0")}`;

    const current = mesMapa.get(mesAno) || { total: 0, count: 0 };
    mesMapa.set(mesAno, {
      total: current.total + (item.valor || 0),
      count: current.count + 1,
    });
  });

  // Ensure all months are represented (even with zero)
  const resultado: Array<{ mes: string; total: number; quantidade: number }> = [];
  for (let i = meses - 1; i >= 0; i--) {
    const date = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const stats = mesMapa.get(mesAno) || { total: 0, count: 0 };
    resultado.push({
      mes: mesAno,
      total: stats.total,
      quantidade: stats.count,
    });
  }

  return resultado;
}
