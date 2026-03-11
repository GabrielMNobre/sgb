import { createClient } from "@/lib/supabase/server";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type {
  PedidoPaes,
  PedidoPaesComCliente,
  PedidoPaesComClienteESemana,
  PedidoPaesFormData,
  FiltrosPedidoPaes,
  InadimplentePaes,
  ResultadosGeraisPaes,
  ResultadoSemanaPaes,
} from "@/types/paes";
import { aplicarCreditos, gerarCredito } from "./creditos-paes";

export async function getPedidosPaes(
  filtros?: FiltrosPedidoPaes
): Promise<PedidoPaesComCliente[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("pedidos_paes")
    .select(`
      *,
      clientes_paes (id, nome, ativo)
    `)
    .order("criado_em", { ascending: false });

  if (filtros?.semanaId) {
    query = query.eq("semana_id", filtros.semanaId);
  }
  if (filtros?.clienteId) {
    query = query.eq("cliente_id", filtros.clienteId);
  }
  if (filtros?.statusPagamento) {
    query = query.eq("status_pagamento", filtros.statusPagamento);
  }
  if (filtros?.statusEntrega) {
    query = query.eq("status_entrega", filtros.statusEntrega);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar pedidos:", error);
    throw new Error("Erro ao buscar pedidos");
  }

  return (data || []).map((pedido: any) => {
    const { clientes_paes, ...pedidoData } = pedido;
    return {
      ...snakeToCamel<PedidoPaes>(pedidoData),
      cliente: clientes_paes ? snakeToCamel(clientes_paes) : null,
    };
  });
}

export async function getPedidosPaesBySemana(
  semanaId: string
): Promise<PedidoPaesComCliente[]> {
  return getPedidosPaes({ semanaId });
}

export async function getPedidosPaesByCliente(
  clienteId: string
): Promise<PedidoPaesComClienteESemana[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pedidos_paes")
    .select(`
      *,
      clientes_paes (id, nome, ativo),
      semanas_paes (id, data_producao, data_entrega, status)
    `)
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar pedidos do cliente:", error);
    throw new Error("Erro ao buscar pedidos do cliente");
  }

  return (data || []).map((pedido: any) => {
    const { clientes_paes, semanas_paes, ...pedidoData } = pedido;
    return {
      ...snakeToCamel<PedidoPaes>(pedidoData),
      cliente: clientes_paes ? snakeToCamel(clientes_paes) : null,
      semana: semanas_paes ? snakeToCamel(semanas_paes) : null,
    };
  });
}

export async function getPedidoPaesById(
  id: string
): Promise<PedidoPaesComCliente | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pedidos_paes")
    .select(`
      *,
      clientes_paes (id, nome, ativo)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar pedido:", error);
    throw new Error("Erro ao buscar pedido");
  }

  const { clientes_paes, ...pedidoData } = data;
  return {
    ...snakeToCamel<PedidoPaes>(pedidoData),
    cliente: clientes_paes ? snakeToCamel(clientes_paes) : null,
  };
}

export async function createPedidoPaes(
  formData: PedidoPaesFormData,
  pago: boolean = false
): Promise<PedidoPaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const valorTotal = formData.quantidade * formData.valorUnitario;

  // First, create the order without credit info
  const insertData: Record<string, unknown> = {
    cliente_id: formData.clienteId,
    semana_id: formData.semanaId,
    quantidade: formData.quantidade,
    valor_unitario: formData.valorUnitario,
    valor_total: valorTotal,
    valor_pago: pago ? valorTotal : 0,
    credito_aplicado: 0,
    status_pagamento: pago ? "pago" : "pendente",
    status_entrega: "pendente",
    pedido_recorrente_id: null,
  };

  const { data, error } = await db
    .from("pedidos_paes")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar pedido:", error);
    throw new Error("Erro ao criar pedido");
  }

  const pedido = snakeToCamel<PedidoPaes>(data);

  // Apply credits if not already paid via recurring
  if (!pago) {
    const { creditosUsados, valorDescontado } = await aplicarCreditos(
      formData.clienteId,
      pedido.id,
      formData.quantidade,
      formData.valorUnitario
    );

    if (creditosUsados > 0) {
      const novoValorPago = valorDescontado;
      const novoStatusPagamento = novoValorPago >= valorTotal ? "pago" : "pendente";

      const { error: updateError } = await db
        .from("pedidos_paes")
        .update({
          credito_aplicado: valorDescontado,
          valor_pago: novoValorPago,
          status_pagamento: novoStatusPagamento,
        })
        .eq("id", pedido.id);

      if (updateError) {
        console.error("Erro ao atualizar crédito no pedido:", updateError);
      }

      return {
        ...pedido,
        creditoAplicado: valorDescontado,
        valorPago: novoValorPago,
        statusPagamento: novoStatusPagamento as any,
      };
    }
  }

  return pedido;
}

export async function deletePedidoPaes(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db.from("pedidos_paes").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir pedido:", error);
    throw new Error("Erro ao excluir pedido");
  }
}

export async function updatePedidoPaes(
  id: string,
  formData: PedidoPaesFormData
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const valorTotal = formData.quantidade * formData.valorUnitario;

  const { error } = await db
    .from("pedidos_paes")
    .update({
      cliente_id: formData.clienteId,
      quantidade: formData.quantidade,
      valor_unitario: formData.valorUnitario,
      valor_total: valorTotal,
      valor_pago: formData.pago ? valorTotal : 0,
      status_pagamento: formData.pago ? "pago" : "pendente",
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar pedido:", error);
    throw new Error("Erro ao atualizar pedido");
  }
}

export async function marcarPagoPaes(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: pedido } = await db
    .from("pedidos_paes")
    .select("valor_total, status_pagamento")
    .eq("id", id)
    .single();

  if (!pedido) throw new Error("Pedido não encontrado");

  const isPago = pedido.status_pagamento === "pago";

  const { error } = await db
    .from("pedidos_paes")
    .update({
      status_pagamento: isPago ? "pendente" : "pago",
      valor_pago: isPago ? 0 : pedido.valor_total,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar pagamento:", error);
    throw new Error("Erro ao atualizar pagamento");
  }
}

export async function marcarEntreguePaes(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("pedidos_paes")
    .update({ status_entrega: "entregue" })
    .eq("id", id);

  if (error) {
    console.error("Erro ao marcar entregue:", error);
    throw new Error("Erro ao marcar entregue");
  }
}

export async function marcarNaoEntreguePaes(
  id: string,
  motivo: string
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get order info for credit generation
  const { data: pedido } = await db
    .from("pedidos_paes")
    .select("cliente_id, quantidade")
    .eq("id", id)
    .single();

  if (!pedido) throw new Error("Pedido não encontrado");

  // Update delivery status
  const { error } = await db
    .from("pedidos_paes")
    .update({
      status_entrega: "nao_entregue",
      motivo_nao_entrega: motivo,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao marcar não entregue:", error);
    throw new Error("Erro ao marcar não entregue");
  }

  // Generate credit for the client
  await gerarCredito(pedido.cliente_id, pedido.quantidade, id);
}

export async function criarPedidoSemDono(
  formData: PedidoPaesFormData,
  pago: boolean = false
): Promise<PedidoPaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const valorTotal = formData.quantidade * formData.valorUnitario;

  const insertData: Record<string, unknown> = {
    cliente_id: formData.clienteId,
    semana_id: formData.semanaId,
    quantidade: formData.quantidade,
    valor_unitario: formData.valorUnitario,
    valor_total: valorTotal,
    valor_pago: pago ? valorTotal : 0,
    credito_aplicado: 0,
    status_pagamento: pago ? "pago" : "pendente",
    status_entrega: "entregue", // Already delivered
  };

  const { data, error } = await db
    .from("pedidos_paes")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar pedido sem dono:", error);
    throw new Error("Erro ao criar pedido sem dono");
  }

  return snakeToCamel<PedidoPaes>(data);
}

export async function calcularTotalPaesMesAtual(): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  const dataInicio = `${anoAtual}-${String(mesAtual).padStart(2, "0")}-01`;
  const dataFim = new Date(anoAtual, mesAtual, 0).toISOString().split("T")[0];

  // Get semanas from this month
  const { data: semanas } = await db
    .from("semanas_paes")
    .select("id")
    .gte("data_entrega", dataInicio)
    .lte("data_entrega", dataFim);

  if (!semanas || semanas.length === 0) return 0;

  const semanaIds = semanas.map((s: any) => s.id);

  const { data: pedidos } = await db
    .from("pedidos_paes")
    .select("valor_pago")
    .in("semana_id", semanaIds)
    .eq("status_pagamento", "pago");

  if (!pedidos) return 0;

  return pedidos.reduce((sum: number, p: any) => sum + (p.valor_pago || 0), 0);
}

export async function getInadimplentes(): Promise<InadimplentePaes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pedidos_paes")
    .select(`
      id,
      cliente_id,
      semana_id,
      quantidade,
      valor_total,
      valor_pago,
      semanas_paes (id, data_producao, data_entrega, status),
      clientes_paes (id, nome, ativo)
    `)
    .eq("status_pagamento", "pendente")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar inadimplentes:", error);
    throw new Error("Erro ao buscar inadimplentes");
  }

  const agrupado = new Map<string, InadimplentePaes>();

  for (const row of data || []) {
    const clienteId: string = row.cliente_id;
    const clienteNome: string = row.clientes_paes?.nome || "Desconhecido";
    const semana = row.semanas_paes;
    const valorPendente = (row.valor_total || 0) - (row.valor_pago || 0);

    if (!agrupado.has(clienteId)) {
      agrupado.set(clienteId, {
        clienteId,
        clienteNome,
        totalPendente: 0,
        totalPaes: 0,
        pedidos: [],
      });
    }

    const entry = agrupado.get(clienteId)!;
    entry.totalPendente += valorPendente;
    entry.totalPaes += row.quantidade || 0;
    entry.pedidos.push({
      pedidoId: row.id,
      semanaId: row.semana_id,
      dataProducao: semana?.data_producao,
      dataEntrega: semana?.data_entrega,
      statusSemana: semana?.status,
      quantidade: row.quantidade,
      valorTotal: row.valor_total,
      valorPago: row.valor_pago,
      valorPendente,
    });
  }

  return Array.from(agrupado.values()).sort((a, b) => b.totalPendente - a.totalPendente);
}

export async function getResultadosGerais(): Promise<ResultadosGeraisPaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: semanasData, error: semanasError } = await db
    .from("semanas_paes")
    .select("id, data_producao, data_entrega, custo_producao, status")
    .order("data_producao", { ascending: false });

  if (semanasError) throw new Error("Erro ao buscar semanas para resultados");

  const { data: pedidosData, error: pedidosError } = await db
    .from("pedidos_paes")
    .select("semana_id, quantidade, valor_total, valor_pago, status_pagamento");

  if (pedidosError) throw new Error("Erro ao buscar pedidos para resultados");

  const pedidosPorSemana = new Map<string, typeof pedidosData>();
  for (const p of pedidosData || []) {
    if (!pedidosPorSemana.has(p.semana_id)) pedidosPorSemana.set(p.semana_id, []);
    pedidosPorSemana.get(p.semana_id)!.push(p);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: configData } = await db
    .from("configuracoes_paes")
    .select("paes_por_fornada")
    .single();
  const paesPorFornada: number = configData?.paes_por_fornada || 10;

  const semanas: ResultadoSemanaPaes[] = (semanasData || []).map((s: any) => {
    const pedidos = pedidosPorSemana.get(s.id) || [];
    const totalPaes = pedidos.reduce((sum: number, p: any) => sum + (p.quantidade || 0), 0);
    const totalValor = pedidos.reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0);
    const totalPago = pedidos.reduce((sum: number, p: any) => sum + (p.valor_pago || 0), 0);
    const custoProducao = s.custo_producao || 0;
    return {
      semanaId: s.id,
      dataProducao: s.data_producao,
      dataEntrega: s.data_entrega,
      status: s.status,
      totalPaes,
      totalPedidos: pedidos.length,
      totalValor,
      totalPago,
      totalPendente: totalValor - totalPago,
      custoProducao,
      lucro: totalPago - custoProducao,
      fornadas: paesPorFornada > 0 ? Math.ceil(totalPaes / paesPorFornada) : 0,
    };
  });

  return {
    totalArrecadado: semanas.reduce((sum, s) => sum + s.totalPago, 0),
    totalPendente: semanas.reduce((sum, s) => sum + s.totalPendente, 0),
    totalPaes: semanas.reduce((sum, s) => sum + s.totalPaes, 0),
    totalPedidos: semanas.reduce((sum, s) => sum + s.totalPedidos, 0),
    totalFornadas: semanas.reduce((sum, s) => sum + s.fornadas, 0),
    custoTotal: semanas.reduce((sum, s) => sum + s.custoProducao, 0),
    lucroTotal: semanas.reduce((sum, s) => sum + s.lucro, 0),
    semanas,
  };
}

export async function getUltimosPedidosPaes(limite: number = 5): Promise<PedidoPaesComCliente[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pedidos_paes")
    .select(`
      *,
      clientes_paes (id, nome, ativo)
    `)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) {
    console.error("Erro ao buscar últimos pedidos:", error);
    return [];
  }

  return (data || []).map((pedido: any) => {
    const { clientes_paes, ...pedidoData } = pedido;
    return {
      ...snakeToCamel<PedidoPaes>(pedidoData),
      cliente: clientes_paes ? snakeToCamel(clientes_paes) : null,
    };
  });
}
