import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type { SemanaPaes, SemanaPaesFormData, SemanaPaesComResumo } from "@/types/paes";
import { getConfiguracoes } from "./configuracoes-paes";

export async function getSemanasPaes(): Promise<SemanaPaes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("semanas_paes")
    .select("*")
    .order("data_entrega", { ascending: false });

  if (error) {
    console.error("Erro ao buscar semanas:", error);
    throw new Error("Erro ao buscar semanas");
  }

  return (data || []).map((item: any) => snakeToCamel<SemanaPaes>(item));
}

export async function getSemanasPaesAbertas(): Promise<SemanaPaes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("semanas_paes")
    .select("*")
    .eq("status", "aberta")
    .order("data_entrega", { ascending: true });

  if (error) {
    console.error("Erro ao buscar semanas abertas:", error);
    throw new Error("Erro ao buscar semanas abertas");
  }

  return (data || []).map((item: any) => snakeToCamel<SemanaPaes>(item));
}

export async function getSemanaPaesById(id: string): Promise<SemanaPaes | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("semanas_paes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar semana:", error);
    throw new Error("Erro ao buscar semana");
  }

  return snakeToCamel<SemanaPaes>(data);
}

export async function getSemanaPaesComResumo(id: string): Promise<SemanaPaesComResumo | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: semana, error: semanaError } = await db
    .from("semanas_paes")
    .select("*")
    .eq("id", id)
    .single();

  if (semanaError) {
    if (semanaError.code === "PGRST116") return null;
    console.error("Erro ao buscar semana:", semanaError);
    throw new Error("Erro ao buscar semana");
  }

  const { data: pedidos, error: pedidosError } = await db
    .from("pedidos_paes")
    .select("quantidade, valor_total, valor_pago, status_pagamento, status_entrega")
    .eq("semana_id", id);

  if (pedidosError) {
    console.error("Erro ao buscar pedidos da semana:", pedidosError);
    throw new Error("Erro ao buscar pedidos da semana");
  }

  const pedidosList = pedidos || [];
  const totalPedidos = pedidosList.length;
  const totalPaes = pedidosList.reduce((sum: number, p: any) => sum + (p.quantidade || 0), 0);
  const totalValor = pedidosList.reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0);
  const totalPago = pedidosList.reduce((sum: number, p: any) => sum + (p.valor_pago || 0), 0);

  const config = await getConfiguracoes();
  const fornadas = Math.ceil(totalPaes / config.paesPorFornada);
  const paesSemDono = Math.max(0, (fornadas * config.paesPorFornada) - totalPaes);

  return {
    ...snakeToCamel<SemanaPaes>(semana),
    totalPedidos,
    totalPaes,
    totalValor,
    totalPago,
    fornadas,
    paesSemDono,
  };
}

export async function getSemanasPaesComResumo(): Promise<SemanaPaesComResumo[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: semanas, error } = await db
    .from("semanas_paes")
    .select("*")
    .order("data_entrega", { ascending: false });

  if (error) {
    console.error("Erro ao buscar semanas:", error);
    throw new Error("Erro ao buscar semanas");
  }

  const config = await getConfiguracoes();
  const result: SemanaPaesComResumo[] = [];

  for (const semana of (semanas || [])) {
    const { data: pedidos } = await db
      .from("pedidos_paes")
      .select("quantidade, valor_total, valor_pago")
      .eq("semana_id", semana.id);

    const pedidosList = pedidos || [];
    const totalPedidos = pedidosList.length;
    const totalPaes = pedidosList.reduce((sum: number, p: any) => sum + (p.quantidade || 0), 0);
    const totalValor = pedidosList.reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0);
    const totalPago = pedidosList.reduce((sum: number, p: any) => sum + (p.valor_pago || 0), 0);
    const fornadas = Math.ceil(totalPaes / config.paesPorFornada);
    const paesSemDono = Math.max(0, (fornadas * config.paesPorFornada) - totalPaes);

    result.push({
      ...snakeToCamel<SemanaPaes>(semana),
      totalPedidos,
      totalPaes,
      totalValor,
      totalPago,
      fornadas,
      paesSemDono,
    });
  }

  return result;
}

export async function createSemanaPaes(formData: SemanaPaesFormData): Promise<SemanaPaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const insertData = {
    data_producao: formData.dataProducao,
    data_entrega: formData.dataEntrega,
    custo_producao: formData.custoProducao || 0,
    status: "aberta",
  };

  const { data, error } = await db
    .from("semanas_paes")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar semana:", error);
    throw new Error("Erro ao criar semana");
  }

  return snakeToCamel<SemanaPaes>(data);
}

export async function updateCustoProducao(id: string, custo: number): Promise<SemanaPaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("semanas_paes")
    .update({ custo_producao: custo })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar custo:", error);
    throw new Error("Erro ao atualizar custo");
  }

  return snakeToCamel<SemanaPaes>(data);
}

export async function finalizarSemanaPaes(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Verify all orders are delivered or marked as not delivered
  const { data: pedidosPendentes } = await db
    .from("pedidos_paes")
    .select("id")
    .eq("semana_id", id)
    .eq("status_entrega", "pendente");

  if (pedidosPendentes && pedidosPendentes.length > 0) {
    throw new Error("Existem pedidos com entrega pendente. Resolva todas as entregas antes de finalizar.");
  }

  const { error } = await db
    .from("semanas_paes")
    .update({ status: "finalizada" })
    .eq("id", id);

  if (error) {
    console.error("Erro ao finalizar semana:", error);
    throw new Error("Erro ao finalizar semana");
  }
}

export async function calcularFornadas(totalPaes: number): Promise<number> {
  const config = await getConfiguracoes();
  return Math.ceil(totalPaes / config.paesPorFornada);
}

export async function getOuCriarSemanaAtual(): Promise<SemanaPaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Find next Friday and Saturday
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const diasAteSexta = diaSemana <= 5 ? 5 - diaSemana : 6; // days until next Friday
  const proximaSexta = new Date(hoje);
  proximaSexta.setDate(hoje.getDate() + diasAteSexta);
  const proximoSabado = new Date(proximaSexta);
  proximoSabado.setDate(proximaSexta.getDate() + 1);

  const dataProducao = proximaSexta.toISOString().split("T")[0];
  const dataEntrega = proximoSabado.toISOString().split("T")[0];

  // Check if week already exists
  const { data: existing } = await db
    .from("semanas_paes")
    .select("*")
    .eq("data_entrega", dataEntrega)
    .single();

  if (existing) {
    return snakeToCamel<SemanaPaes>(existing);
  }

  // Create new week
  const { data, error } = await db
    .from("semanas_paes")
    .insert({
      data_producao: dataProducao,
      data_entrega: dataEntrega,
      custo_producao: 0,
      status: "aberta",
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar semana:", error);
    throw new Error("Erro ao criar semana");
  }

  return snakeToCamel<SemanaPaes>(data);
}
