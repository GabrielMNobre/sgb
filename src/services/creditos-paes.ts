import { createClient } from "@/lib/supabase/server";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type { CreditoPaes, HistoricoUsoCredito } from "@/types/paes";

export async function getCreditosDisponiveis(clienteId: string): Promise<CreditoPaes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("creditos_paes")
    .select("*")
    .eq("cliente_id", clienteId)
    .gt("quantidade_disponivel", 0)
    .order("criado_em", { ascending: true }); // FIFO

  if (error) {
    console.error("Erro ao buscar créditos disponíveis:", error);
    throw new Error("Erro ao buscar créditos disponíveis");
  }

  return (data || []).map((item: any) => snakeToCamel<CreditoPaes>(item));
}

export async function getCreditosByCliente(clienteId: string): Promise<CreditoPaes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("creditos_paes")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar créditos:", error);
    throw new Error("Erro ao buscar créditos");
  }

  return (data || []).map((item: any) => snakeToCamel<CreditoPaes>(item));
}

export async function gerarCredito(
  clienteId: string,
  quantidade: number,
  pedidoOrigemId: string
): Promise<CreditoPaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Check if credit already exists for this order (idempotency)
  const { data: existing } = await db
    .from("creditos_paes")
    .select("*")
    .eq("pedido_origem_id", pedidoOrigemId)
    .single();

  if (existing) {
    return snakeToCamel<CreditoPaes>(existing);
  }

  const { data, error } = await db
    .from("creditos_paes")
    .insert({
      cliente_id: clienteId,
      quantidade_original: quantidade,
      quantidade_disponivel: quantidade,
      pedido_origem_id: pedidoOrigemId,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao gerar crédito:", error);
    throw new Error("Erro ao gerar crédito");
  }

  return snakeToCamel<CreditoPaes>(data);
}

export async function aplicarCreditos(
  clienteId: string,
  pedidoId: string,
  quantidadeNecessaria: number,
  valorUnitario: number
): Promise<{ creditosUsados: number; valorDescontado: number }> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get available credits (FIFO - ordered by criado_em ASC)
  const creditos = await getCreditosDisponiveis(clienteId);

  if (creditos.length === 0) {
    return { creditosUsados: 0, valorDescontado: 0 };
  }

  let restante = quantidadeNecessaria;
  let totalUsado = 0;

  for (const credito of creditos) {
    if (restante <= 0) break;

    const usar = Math.min(restante, credito.quantidadeDisponivel);

    // Update credit remaining quantity
    const { error: updateError } = await db
      .from("creditos_paes")
      .update({
        quantidade_disponivel: credito.quantidadeDisponivel - usar,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", credito.id);

    if (updateError) {
      console.error("Erro ao atualizar crédito:", updateError);
      continue;
    }

    // Register usage history
    const { error: histError } = await db
      .from("historico_uso_creditos")
      .insert({
        credito_id: credito.id,
        pedido_id: pedidoId,
        quantidade_usada: usar,
      });

    if (histError) {
      console.error("Erro ao registrar uso de crédito:", histError);
    }

    totalUsado += usar;
    restante -= usar;
  }

  return {
    creditosUsados: totalUsado,
    valorDescontado: totalUsado * valorUnitario,
  };
}

export async function getHistoricoUsoCreditos(creditoId: string): Promise<HistoricoUsoCredito[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("historico_uso_creditos")
    .select("*")
    .eq("credito_id", creditoId)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar histórico de créditos:", error);
    throw new Error("Erro ao buscar histórico de créditos");
  }

  return (data || []).map((item: any) => snakeToCamel<HistoricoUsoCredito>(item));
}

export async function getTotalCreditosDisponiveis(clienteId: string): Promise<number> {
  const creditos = await getCreditosDisponiveis(clienteId);
  return creditos.reduce((sum, c) => sum + c.quantidadeDisponivel, 0);
}
