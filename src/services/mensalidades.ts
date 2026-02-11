import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import {
  MENSALIDADE_DESBRAVADOR,
  MENSALIDADE_DIRETORIA,
  META_PERCENTUAL,
  MESES_ABREVIADOS,
  MESES_LABELS,
} from "@/lib/constants";
import type {
  Mensalidade,
  MensalidadeComRelacoes,
  MensalidadeFormData,
  FiltrosMensalidade,
  TotaisMensalidade,
  TaxaAdesao,
  MetaMensal,
  ReceitaMensal,
  MembroInadimplente,
  HistoricoMensalidade,
  RegistrarPagamentoFormData,
} from "@/types/mensalidade";

// ========== CRUD Operations ==========

export async function getMensalidades(
  filtros?: FiltrosMensalidade
): Promise<MensalidadeComRelacoes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("mensalidades")
    .select(`
      *,
      membros (
        id,
        nome,
        tipo,
        isento_mensalidade,
        unidades (
          id,
          nome,
          cor_primaria
        )
      )
    `)
    .order("ano", { ascending: false })
    .order("mes", { ascending: false });

  if (filtros?.mes) {
    query = query.eq("mes", filtros.mes);
  }
  if (filtros?.ano) {
    query = query.eq("ano", filtros.ano);
  }
  if (filtros?.status) {
    query = query.eq("status", filtros.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar mensalidades:", error);
    throw new Error("Erro ao buscar mensalidades");
  }

  return (data || [])
    .map((item: Record<string, unknown>) => {
      const mensalidade = snakeToCamel<Mensalidade>(item);
      const membros = item.membros as Record<string, unknown> | null;
      const unidades = membros?.unidades as Record<string, unknown> | null;

      return {
        ...mensalidade,
        membro: membros
          ? {
              id: membros.id as string,
              nome: membros.nome as string,
              tipo: membros.tipo as "desbravador" | "diretoria",
              isentoMensalidade: membros.isento_mensalidade as boolean,
              unidade: unidades
                ? {
                    id: unidades.id as string,
                    nome: unidades.nome as string,
                    corPrimaria: unidades.cor_primaria as string,
                  }
                : undefined,
            }
          : ({
              id: "",
              nome: "",
              tipo: "desbravador" as const,
              isentoMensalidade: false,
            } as any),
      } as MensalidadeComRelacoes;
    })
    .filter((m: MensalidadeComRelacoes) => {
      // Apply additional client-side filters
      if (filtros?.tipo && m.membro.tipo !== filtros.tipo) return false;
      if (filtros?.unidadeId && m.membro.unidade?.id !== filtros.unidadeId)
        return false;
      if (
        filtros?.busca &&
        !m.membro.nome.toLowerCase().includes(filtros.busca.toLowerCase())
      )
        return false;
      return true;
    });
}

export async function getMensalidadeById(
  id: string
): Promise<MensalidadeComRelacoes | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("mensalidades")
    .select(`
      *,
      membros (
        id,
        nome,
        tipo,
        isento_mensalidade,
        unidades (
          id,
          nome,
          cor_primaria
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar mensalidade:", error);
    throw new Error("Erro ao buscar mensalidade");
  }

  const mensalidade = snakeToCamel<Mensalidade>(data);
  const membros = data.membros as Record<string, unknown> | null;
  const unidades = membros?.unidades as Record<string, unknown> | null;

  return {
    ...mensalidade,
    membro: membros
      ? {
          id: membros.id as string,
          nome: membros.nome as string,
          tipo: membros.tipo as "desbravador" | "diretoria",
          isentoMensalidade: membros.isento_mensalidade as boolean,
          unidade: unidades
            ? {
                id: unidades.id as string,
                nome: unidades.nome as string,
                corPrimaria: unidades.cor_primaria as string,
              }
            : undefined,
        }
      : ({
          id: "",
          nome: "",
          tipo: "desbravador" as const,
          isentoMensalidade: false,
        } as any),
  } as MensalidadeComRelacoes;
}

export async function createMensalidade(
  formData: MensalidadeFormData
): Promise<Mensalidade> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToInsert = camelToSnake({
    membroId: formData.membroId,
    mes: formData.mes,
    ano: formData.ano,
    dataPagamento: formData.dataPagamento || null,
    valor: formData.valor,
    status: formData.status,
  });

  const { data, error } = await db
    .from("mensalidades")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar mensalidade:", error);
    throw new Error("Erro ao criar mensalidade");
  }

  return snakeToCamel<Mensalidade>(data);
}

export async function updateMensalidade(
  id: string,
  formData: MensalidadeFormData
): Promise<Mensalidade> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToUpdate = camelToSnake({
    membroId: formData.membroId,
    mes: formData.mes,
    ano: formData.ano,
    dataPagamento: formData.dataPagamento || null,
    valor: formData.valor,
    status: formData.status,
    atualizadoEm: new Date().toISOString(),
  });

  const { data, error } = await db
    .from("mensalidades")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar mensalidade:", error);
    throw new Error("Erro ao atualizar mensalidade");
  }

  return snakeToCamel<Mensalidade>(data);
}

export async function deleteMensalidade(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db.from("mensalidades").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir mensalidade:", error);
    throw new Error("Erro ao excluir mensalidade");
  }
}

// ========== Business Logic ==========

/**
 * Auto-generates pending payments for a specific month/year
 * Only creates for active, non-exempt members
 * Skips if payment already exists
 */
export async function gerarMensalidadesDoMes(
  mes: number,
  ano: number
): Promise<{ criadas: number; ignoradas: number }> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get active, non-exempt members
  const { data: membros, error: membrosError } = await db
    .from("membros")
    .select("id, tipo")
    .eq("ativo", true)
    .eq("isento_mensalidade", false);

  if (membrosError) {
    console.error("Erro ao buscar membros:", membrosError);
    throw new Error("Erro ao buscar membros para gerar mensalidades");
  }

  if (!membros || membros.length === 0) {
    return { criadas: 0, ignoradas: 0 };
  }

  // Check existing payments for this month/year
  const { data: existentes } = await db
    .from("mensalidades")
    .select("membro_id")
    .eq("mes", mes)
    .eq("ano", ano);

  const membroIdsExistentes = new Set(
    existentes?.map((e: any) => e.membro_id) || []
  );

  // Filter members who don't have payment yet
  const membrosParaCriar = membros.filter(
    (m: any) => !membroIdsExistentes.has(m.id)
  );

  if (membrosParaCriar.length === 0) {
    return { criadas: 0, ignoradas: membros.length };
  }

  // Insert batch
  const mensalidadesParaCriar = membrosParaCriar.map((membro: any) => ({
    membro_id: membro.id,
    mes,
    ano,
    valor:
      membro.tipo === "desbravador"
        ? MENSALIDADE_DESBRAVADOR
        : MENSALIDADE_DIRETORIA,
    status: "pendente",
  }));

  const { error: insertError } = await db
    .from("mensalidades")
    .insert(mensalidadesParaCriar);

  if (insertError) {
    console.error("Erro ao criar mensalidades:", insertError);
    throw new Error("Erro ao gerar mensalidades");
  }

  return {
    criadas: membrosParaCriar.length,
    ignoradas: membros.length - membrosParaCriar.length,
  };
}

/**
 * Register payment for single or multiple payments
 */
export async function registrarPagamentos(
  formData: RegistrarPagamentoFormData
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { error } = await db
    .from("mensalidades")
    .update({
      status: "pago",
      data_pagamento: formData.dataPagamento,
      registrado_por: user.id,
      atualizado_em: new Date().toISOString(),
    })
    .in("id", formData.mensalidadeIds);

  if (error) {
    console.error("Erro ao registrar pagamentos:", error);
    throw new Error("Erro ao registrar pagamentos");
  }
}

/**
 * Reverse payment (undo)
 */
export async function estornarPagamento(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("mensalidades")
    .update({
      status: "pendente",
      data_pagamento: null,
      registrado_por: null,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao estornar pagamento:", error);
    throw new Error("Erro ao estornar pagamento");
  }
}

// ========== Analytics & Reports ==========

/**
 * Calculate totals for a specific month/year
 */
export async function calcularTotaisMensalidade(
  mes?: number,
  ano?: number
): Promise<TotaisMensalidade> {
  const mensalidades = await getMensalidades({ mes, ano });

  const totalPago = mensalidades
    .filter((m) => m.status === "pago")
    .reduce((sum, m) => sum + m.valor, 0);

  const totalPendente = mensalidades
    .filter((m) => m.status === "pendente")
    .reduce((sum, m) => sum + m.valor, 0);

  const quantidadePaga = mensalidades.filter((m) => m.status === "pago").length;
  const quantidadePendente = mensalidades.filter(
    (m) => m.status === "pendente"
  ).length;

  return {
    totalPago,
    totalPendente,
    totalGeral: totalPago + totalPendente,
    quantidadePaga,
    quantidadePendente,
    quantidadeTotal: mensalidades.length,
  };
}

/**
 * Calculate adhesion rate by type (desbravador/diretoria)
 */
export async function calcularTaxaAdesao(
  mes: number,
  ano: number
): Promise<TaxaAdesao[]> {
  const mensalidades = await getMensalidades({ mes, ano });

  const tipos: ("desbravador" | "diretoria")[] = ["desbravador", "diretoria"];

  return tipos.map((tipo) => {
    const doTipo = mensalidades.filter((m) => m.membro.tipo === tipo);
    const pagos = doTipo.filter((m) => m.status === "pago");

    return {
      tipo,
      totalAtivos: doTipo.length,
      totalPago: pagos.length,
      totalPendente: doTipo.length - pagos.length,
      percentualAdesao:
        doTipo.length > 0 ? (pagos.length / doTipo.length) * 100 : 0,
    };
  });
}

/**
 * Calculate monthly goal achievement
 */
export async function calcularMetaMensal(
  mes: number,
  ano: number
): Promise<MetaMensal> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get all non-exempt active members
  const { data: membros } = await db
    .from("membros")
    .select("tipo")
    .eq("ativo", true)
    .eq("isento_mensalidade", false);

  const totalDesbravadores =
    membros?.filter((m: any) => m.tipo === "desbravador").length || 0;
  const totalDiretoria =
    membros?.filter((m: any) => m.tipo === "diretoria").length || 0;

  const valorPossivel =
    totalDesbravadores * MENSALIDADE_DESBRAVADOR +
    totalDiretoria * MENSALIDADE_DIRETORIA;

  const valorMeta = valorPossivel * META_PERCENTUAL;

  // Get payments
  const mensalidades = await getMensalidades({ mes, ano });
  const valorArrecadado = mensalidades
    .filter((m) => m.status === "pago")
    .reduce((sum, m) => sum + m.valor, 0);

  const membrosPagos = mensalidades.filter((m) => m.status === "pago").length;

  return {
    mes,
    ano,
    valorPossivel,
    valorMeta,
    valorArrecadado,
    percentualAlcancado:
      valorMeta > 0 ? (valorArrecadado / valorMeta) * 100 : 0,
    membrosAtivos: totalDesbravadores + totalDiretoria,
    membrosPagos,
  };
}

/**
 * Get revenue data for the last 6 months
 */
export async function obterReceitaUltimosSeisMeses(): Promise<ReceitaMensal[]> {
  const hoje = new Date();
  const resultado: ReceitaMensal[] = [];

  for (let i = 5; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();

    const mensalidades = await getMensalidades({ mes, ano, status: "pago" });

    const totalDesbravadores = mensalidades
      .filter((m) => m.membro.tipo === "desbravador")
      .reduce((sum, m) => sum + m.valor, 0);

    const totalDiretoria = mensalidades
      .filter((m) => m.membro.tipo === "diretoria")
      .reduce((sum, m) => sum + m.valor, 0);

    resultado.push({
      mes,
      ano,
      mesNome: MESES_ABREVIADOS[mes],
      totalDesbravadores,
      totalDiretoria,
      totalGeral: totalDesbravadores + totalDiretoria,
    });
  }

  return resultado;
}

/**
 * Count total number of delinquent members
 */
export async function contarInadimplentes(): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get distinct member IDs with pending payments
  const { data, error } = await db
    .from("mensalidades")
    .select("membro_id")
    .eq("status", "pendente");

  if (error) {
    console.error("Erro ao contar inadimplentes:", error);
    return 0;
  }

  // Count unique members
  const uniqueMembers = new Set((data || []).map((m: any) => m.membro_id));
  return uniqueMembers.size;
}

/**
 * Get top 10 delinquent members
 */
export async function obterTop10Inadimplentes(): Promise<
  MembroInadimplente[]
> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get all pending payments
  const { data, error } = await db
    .from("mensalidades")
    .select(`
      *,
      membros (
        id,
        nome,
        tipo,
        unidades (
          id,
          nome,
          cor_primaria
        )
      )
    `)
    .eq("status", "pendente")
    .order("ano")
    .order("mes");

  if (error) {
    console.error("Erro ao buscar inadimplentes:", error);
    throw new Error("Erro ao buscar inadimplentes");
  }

  // Group by member
  const porMembro = new Map<
    string,
    {
      nome: string;
      tipo: string;
      unidade: any;
      mensalidades: any[];
    }
  >();

  (data || []).forEach((item: any) => {
    const membroId = item.membro_id;
    if (!porMembro.has(membroId)) {
      porMembro.set(membroId, {
        nome: item.membros.nome,
        tipo: item.membros.tipo,
        unidade: item.membros.unidades,
        mensalidades: [],
      });
    }
    porMembro.get(membroId)!.mensalidades.push(item);
  });

  // Convert to array and sort
  const inadimplentes: MembroInadimplente[] = Array.from(
    porMembro.entries()
  )
    .map(([membroId, info]) => ({
      membroId,
      membroNome: info.nome,
      tipo: info.tipo as "desbravador" | "diretoria",
      unidade: info.unidade
        ? {
            id: info.unidade.id,
            nome: info.unidade.nome,
            corPrimaria: info.unidade.cor_primaria,
          }
        : undefined,
      quantidadePendente: info.mensalidades.length,
      valorPendente: info.mensalidades.reduce(
        (sum: number, m: any) => sum + m.valor,
        0
      ),
      mesesPendentes: info.mensalidades.map(
        (m: any) => `${MESES_ABREVIADOS[m.mes]}/${m.ano}`
      ),
    }))
    .sort((a, b) => b.quantidadePendente - a.quantidadePendente)
    .slice(0, 10);

  return inadimplentes;
}

/**
 * Get payment history for a specific member
 */
export async function obterHistoricoMembro(
  membroId: string
): Promise<HistoricoMensalidade[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("mensalidades")
    .select("*")
    .eq("membro_id", membroId)
    .order("ano", { ascending: false })
    .order("mes", { ascending: false });

  if (error) {
    console.error("Erro ao buscar histórico:", error);
    throw new Error("Erro ao buscar histórico");
  }

  // Group by year
  const porAno = new Map<number, any[]>();
  (data || []).forEach((item: any) => {
    if (!porAno.has(item.ano)) {
      porAno.set(item.ano, []);
    }
    porAno.get(item.ano)!.push(item);
  });

  return Array.from(porAno.entries()).map(([ano, mensalidades]) => {
    const totalPago = mensalidades
      .filter((m) => m.status === "pago")
      .reduce((sum, m) => sum + m.valor, 0);

    const totalPendente = mensalidades
      .filter((m) => m.status === "pendente")
      .reduce((sum, m) => sum + m.valor, 0);

    return {
      ano,
      totalPago,
      totalPendente,
      quantidadePaga: mensalidades.filter((m) => m.status === "pago").length,
      quantidadePendente: mensalidades.filter((m) => m.status === "pendente")
        .length,
      meses: mensalidades.map((m) => ({
        mes: m.mes,
        mesNome: MESES_LABELS[m.mes],
        status: m.status,
        valor: m.valor,
        dataPagamento: m.data_pagamento
          ? new Date(m.data_pagamento)
          : undefined,
      })),
    };
  });
}
