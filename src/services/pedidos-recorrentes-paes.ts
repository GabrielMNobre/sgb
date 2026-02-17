import { createClient } from "@/lib/supabase/server";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type {
  PedidoRecorrentePaes,
  PedidoRecorrentePaesComCliente,
  PedidoRecorrentePaesFormData,
  PedidoPaes,
} from "@/types/paes";
import { createPedidoPaes } from "./pedidos-paes";
import { getSemanasPaesAbertas } from "./semanas-paes";

export async function getPedidosRecorrentesPaes(): Promise<PedidoRecorrentePaesComCliente[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pedidos_recorrentes_paes")
    .select(`
      *,
      clientes_paes (id, nome, ativo)
    `)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar pedidos recorrentes:", error);
    throw new Error("Erro ao buscar pedidos recorrentes");
  }

  return (data || []).map((pedido: any) => {
    const { clientes_paes, ...pedidoData } = pedido;
    return {
      ...snakeToCamel<PedidoRecorrentePaes>(pedidoData),
      cliente: clientes_paes ? snakeToCamel(clientes_paes) : null,
    };
  });
}

export async function getPedidosRecorrentesPaesAtivos(): Promise<PedidoRecorrentePaesComCliente[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pedidos_recorrentes_paes")
    .select(`
      *,
      clientes_paes (id, nome, ativo)
    `)
    .eq("ativo", true)
    .gt("semanas_restantes", 0)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar recorrentes ativos:", error);
    throw new Error("Erro ao buscar recorrentes ativos");
  }

  return (data || []).map((pedido: any) => {
    const { clientes_paes, ...pedidoData } = pedido;
    return {
      ...snakeToCamel<PedidoRecorrentePaes>(pedidoData),
      cliente: clientes_paes ? snakeToCamel(clientes_paes) : null,
    };
  });
}

export async function getPedidoRecorrentePaesById(
  id: string
): Promise<PedidoRecorrentePaesComCliente | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pedidos_recorrentes_paes")
    .select(`
      *,
      clientes_paes (id, nome, ativo)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar recorrente:", error);
    throw new Error("Erro ao buscar recorrente");
  }

  const { clientes_paes, ...pedidoData } = data;
  return {
    ...snakeToCamel<PedidoRecorrentePaes>(pedidoData),
    cliente: clientes_paes ? snakeToCamel(clientes_paes) : null,
  };
}

export async function getPedidosRecorrentesByCliente(
  clienteId: string
): Promise<PedidoRecorrentePaesComCliente[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pedidos_recorrentes_paes")
    .select(`
      *,
      clientes_paes (id, nome, ativo)
    `)
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar recorrentes do cliente:", error);
    throw new Error("Erro ao buscar recorrentes do cliente");
  }

  return (data || []).map((pedido: any) => {
    const { clientes_paes, ...pedidoData } = pedido;
    return {
      ...snakeToCamel<PedidoRecorrentePaes>(pedidoData),
      cliente: clientes_paes ? snakeToCamel(clientes_paes) : null,
    };
  });
}

export async function createPedidoRecorrentePaes(
  formData: PedidoRecorrentePaesFormData
): Promise<PedidoRecorrentePaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const valorTotal = formData.quantidadePaes * formData.quantidadeSemanas * formData.valorUnitario;

  const insertData: Record<string, unknown> = {
    cliente_id: formData.clienteId,
    quantidade_paes: formData.quantidadePaes,
    quantidade_semanas: formData.quantidadeSemanas,
    semanas_restantes: formData.quantidadeSemanas,
    valor_unitario: formData.valorUnitario,
    valor_total: valorTotal,
    semana_inicio_id: formData.semanaInicioId || null,
    ativo: true,
  };

  const { data, error } = await db
    .from("pedidos_recorrentes_paes")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar pedido recorrente:", error);
    throw new Error("Erro ao criar pedido recorrente");
  }

  const recorrente = snakeToCamel<PedidoRecorrentePaes>(data);

  // Generate orders for all open weeks (up to quantidadeSemanas)
  const semanasAbertas = await getSemanasPaesAbertas();
  let semanasGeradas = 0;

  for (const semana of semanasAbertas) {
    if (semanasGeradas >= formData.quantidadeSemanas) break;

    // Check for duplicates - maybeSingle avoids error on 0 rows
    const { data: existing } = await db
      .from("pedidos_paes")
      .select("id")
      .eq("pedido_recorrente_id", recorrente.id)
      .eq("semana_id", semana.id)
      .maybeSingle();

    if (!existing) {
      await createPedidoPaes(
        {
          clienteId: formData.clienteId,
          semanaId: semana.id,
          quantidade: formData.quantidadePaes,
          valorUnitario: formData.valorUnitario,
        },
        true // All recurring orders are pre-paid
      );

      semanasGeradas++;
    }
  }

  // Update semanas_restantes
  if (semanasGeradas > 0) {
    await db
      .from("pedidos_recorrentes_paes")
      .update({ semanas_restantes: formData.quantidadeSemanas - semanasGeradas })
      .eq("id", recorrente.id);
  }

  return recorrente;
}

export async function gerarPedidosRecorrentesParaSemana(
  semanaId: string
): Promise<PedidoPaes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get all active recurring orders with remaining weeks
  const { data: recorrentes, error: recError } = await db
    .from("pedidos_recorrentes_paes")
    .select("*")
    .eq("ativo", true)
    .gt("semanas_restantes", 0);

  if (recError) {
    console.error("Erro ao buscar recorrentes ativos:", recError);
    return [];
  }

  if (!recorrentes || recorrentes.length === 0) {
    console.log("Nenhum pedido recorrente ativo encontrado");
    return [];
  }

  console.log(`Encontrados ${recorrentes.length} recorrentes ativos para gerar`);

  const pedidosCriados: PedidoPaes[] = [];

  for (const recorrente of recorrentes) {
    // Check for duplicates (idempotent) - maybeSingle avoids error on 0 rows
    const { data: existing } = await db
      .from("pedidos_paes")
      .select("id")
      .eq("pedido_recorrente_id", recorrente.id)
      .eq("semana_id", semanaId)
      .maybeSingle();

    if (existing) continue;

    const pedido = await createPedidoPaes(
      {
        clienteId: recorrente.cliente_id,
        semanaId,
        quantidade: recorrente.quantidade_paes,
        valorUnitario: recorrente.valor_unitario,
      },
      true // Pre-paid
    );

    // Update the pedido to link to recorrente
    await db
      .from("pedidos_paes")
      .update({ pedido_recorrente_id: recorrente.id })
      .eq("id", pedido.id);

    // Decrement semanas_restantes
    const novasRestantes = recorrente.semanas_restantes - 1;
    await db
      .from("pedidos_recorrentes_paes")
      .update({
        semanas_restantes: novasRestantes,
        ativo: novasRestantes > 0,
      })
      .eq("id", recorrente.id);

    pedidosCriados.push(pedido);
  }

  return pedidosCriados;
}

export async function cancelarPedidoRecorrente(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("pedidos_recorrentes_paes")
    .update({ ativo: false })
    .eq("id", id);

  if (error) {
    console.error("Erro ao cancelar recorrente:", error);
    throw new Error("Erro ao cancelar recorrente");
  }
}
