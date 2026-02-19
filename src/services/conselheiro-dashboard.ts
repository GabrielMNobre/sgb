import { createClient } from "@/lib/supabase/server";
import { MESES_ABREVIADOS } from "@/lib/constants";

// ========== Interfaces ==========

export interface UnidadeConselheiroCompleta {
  unidadeId: string;
  unidadeNome: string;
  descricao?: string;
  corPrimaria: string;
  corSecundaria: string;
  principal: boolean;
  conselheiros: { nome: string; principal: boolean }[];
}

export interface ClasseBreakdown {
  classeNome: string;
  quantidade: number;
}

export interface EstatisticasPresencaUnidade {
  taxaPresenca: number;
  taxaPontualidade: number;
  taxaMaterial: number;
  taxaUniforme: number;
  totalEncontros: number;
}

export interface MembroComFaltas {
  membroId: string;
  membroNome: string;
  totalFaltas: number;
  totalEncontros: number;
}

export interface ResumoMensalidadesGrupo {
  total: number;
  emDia: number;
  pendentes: number;
  isentos: number;
}

export interface ResumoMensalidadesUnidade {
  totalMembros: number;
  emDia: number;
  pendentes: number;
  isentos: number;
  desbravadores: ResumoMensalidadesGrupo;
  conselheiros: ResumoMensalidadesGrupo;
}

export interface MembroInadimplente {
  membroId: string;
  membroNome: string;
  mesesPendentes: string[];
}

export interface HistoricoPresencasResult {
  encontros: {
    encontroId: string;
    data: string;
    descricao?: string;
    presentes: number;
    faltas: number;
    percentualPresenca: number;
    detalhes: {
      membroId: string;
      membroNome: string;
      status: string;
      temMaterial: boolean;
      temUniforme: boolean;
    }[];
  }[];
  membros: {
    membroId: string;
    membroNome: string;
    totalPresencas: number;
    totalFaltas: number;
    percentualPresenca: number;
    historico: {
      encontroId: string;
      data: string;
      status: string;
    }[];
  }[];
  resumo: {
    totalEncontros: number;
    mediaPresenca: number;
    mediaPontualidade: number;
    membroMaisPresente: string;
    membroMaisFaltas: string;
  };
}

export interface MembroDetalhesConselheiro {
  id: string;
  nome: string;
  dataNascimento?: string;
  tipo: string;
  telefone?: string;
  responsavel?: string;
  telefoneResponsavel?: string;
  classe?: { id: string; nome: string };
  unidade?: { id: string; nome: string };
  historicoClasses: { classeNome: string; ano: number }[];
  ultimasPresencas: {
    data: string;
    status: string;
    temMaterial: boolean;
    temUniforme: boolean;
  }[];
  estatisticas: {
    taxaPresenca: number;
    taxaPontualidade: number;
    taxaMaterial: number;
    taxaUniforme: number;
  };
  statusMensalidade?: "em_dia" | "pendente" | "isento";
}

// ========== Helpers ==========

/**
 * Returns conselheiro membro_ids linked to a unit via conselheiros_unidades.
 */
export async function getConselheiroIdsDaUnidade(
  unidadeId: string
): Promise<string[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("conselheiros_unidades")
    .select("membro_id")
    .eq("unidade_id", unidadeId);

  if (error) {
    console.error("Erro ao buscar conselheiros da unidade:", error);
    return [];
  }

  return (data || []).map(
    (v: Record<string, unknown>) => v.membro_id as string
  );
}

/**
 * Returns all active member IDs for a unit:
 * desbravadores (via membros.unidade_id) + conselheiros (via conselheiros_unidades).
 */
export async function getMembroIdsDaUnidade(
  unidadeId: string
): Promise<{
  desbravadorIds: string[];
  conselheiroMembroIds: string[];
  todosIds: string[];
}> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 1. Get active desbravadores
  const { data: desbravadores, error: desbError } = await db
    .from("membros")
    .select("id")
    .eq("unidade_id", unidadeId)
    .eq("tipo", "desbravador")
    .eq("ativo", true);

  if (desbError) {
    console.error("Erro ao buscar desbravadores:", desbError);
    throw new Error("Erro ao buscar desbravadores da unidade");
  }

  const desbravadorIds = (desbravadores || []).map(
    (d: Record<string, unknown>) => d.id as string
  );

  // 2. Get conselheiro member IDs (linked via conselheiros_unidades)
  // IDs are trusted from foreign key - no need to re-query membros (avoids RLS issues)
  const conselheiroMembroIds = await getConselheiroIdsDaUnidade(unidadeId);

  // 3. Combine and deduplicate
  const todosSet = new Set([...desbravadorIds, ...conselheiroMembroIds]);

  return {
    desbravadorIds,
    conselheiroMembroIds,
    todosIds: Array.from(todosSet),
  };
}

// ========== Functions ==========

/**
 * Returns full unit data with colors, description, and conselheiros list
 * for the logged-in conselheiro.
 */
export async function getUnidadeDoConselheiroCompleta(
  usuarioId: string
): Promise<UnidadeConselheiroCompleta | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 1. Get membro_id from usuario
  const { data: usuario, error: usuarioError } = await db
    .from("usuarios")
    .select("membro_id")
    .eq("id", usuarioId)
    .single();

  if (usuarioError || !usuario || !usuario.membro_id) {
    if (usuarioError?.code !== "PGRST116") {
      console.error("Erro ao buscar usuário:", usuarioError);
    }
    return null;
  }

  // 2. Get conselheiros_unidades record with unidade data
  const { data: vinculo, error: vinculoError } = await db
    .from("conselheiros_unidades")
    .select(`
      unidade_id,
      principal,
      unidades (
        id,
        nome,
        descricao,
        cor_primaria,
        cor_secundaria
      )
    `)
    .eq("membro_id", usuario.membro_id)
    .order("principal", { ascending: false })
    .limit(1)
    .single();

  if (vinculoError) {
    if (vinculoError.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar vínculo do conselheiro:", vinculoError);
    return null;
  }

  const unidade = vinculo.unidades as Record<string, unknown> | null;
  if (!unidade) {
    return null;
  }

  const unidadeId = vinculo.unidade_id as string;

  // 3. Get all conselheiros for this unit
  const { data: conselheirosData, error: conselheirosError } = await db
    .from("conselheiros_unidades")
    .select(`
      principal,
      membros (
        nome
      )
    `)
    .eq("unidade_id", unidadeId);

  if (conselheirosError) {
    console.error("Erro ao buscar conselheiros da unidade:", conselheirosError);
  }

  const conselheiros = (conselheirosData || []).map((c: Record<string, unknown>) => {
    const membro = c.membros as Record<string, unknown> | null;
    return {
      nome: membro?.nome as string || "",
      principal: c.principal as boolean,
    };
  });

  return {
    unidadeId,
    unidadeNome: unidade.nome as string || "",
    descricao: unidade.descricao as string | undefined,
    corPrimaria: (unidade.cor_primaria as string) || "#1a2b5f",
    corSecundaria: (unidade.cor_secundaria as string) || "#f5c518",
    principal: vinculo.principal as boolean,
    conselheiros,
  };
}

/**
 * Returns class breakdown for the unit's active desbravadores.
 */
export async function getDesbravadoresPorClasseUnidade(
  unidadeId: string
): Promise<ClasseBreakdown[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("membros")
    .select(`
      classe_id,
      classes (
        id,
        nome,
        ordem
      )
    `)
    .eq("unidade_id", unidadeId)
    .eq("tipo", "desbravador")
    .eq("ativo", true)
    .not("classe_id", "is", null);

  if (error) {
    console.error("Erro ao buscar desbravadores por classe da unidade:", error);
    throw new Error("Erro ao buscar desbravadores por classe da unidade");
  }

  // Group by class
  const grouped = new Map<string, { nome: string; ordem: number; count: number }>();

  (data || []).forEach((item: Record<string, unknown>) => {
    const classes = item.classes as Record<string, unknown> | null;
    if (!classes) return;

    const classeId = classes.id as string;
    const classeNome = classes.nome as string;
    const ordem = classes.ordem as number;

    if (grouped.has(classeId)) {
      grouped.get(classeId)!.count++;
    } else {
      grouped.set(classeId, { nome: classeNome, ordem, count: 1 });
    }
  });

  return Array.from(grouped.values())
    .sort((a, b) => a.ordem - b.ordem)
    .map((info) => ({
      classeNome: info.nome,
      quantidade: info.count,
    }));
}

/**
 * Returns 3-month presence statistics for the unit.
 */
export async function getEstatisticasPresencaUnidade(
  unidadeId: string
): Promise<EstatisticasPresencaUnidade> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const defaults: EstatisticasPresencaUnidade = {
    taxaPresenca: 0,
    taxaPontualidade: 0,
    taxaMaterial: 0,
    taxaUniforme: 0,
    totalEncontros: 0,
  };

  // 1. Get encontros from last 3 months (finalizados or em_andamento)
  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
  const dataInicio = tresMesesAtras.toISOString().split("T")[0];

  const { data: encontros, error: encontrosError } = await db
    .from("encontros")
    .select("id")
    .gte("data", dataInicio)
    .in("status", ["finalizado", "em_andamento"]);

  if (encontrosError) {
    console.error("Erro ao buscar encontros:", encontrosError);
    return defaults;
  }

  if (!encontros || encontros.length === 0) {
    return defaults;
  }

  const encontroIds = (encontros as Record<string, unknown>[]).map(
    (e) => e.id as string
  );

  // 2. Get active desbravadores for this unit
  const { data: membros, error: membrosError } = await db
    .from("membros")
    .select("id")
    .eq("unidade_id", unidadeId)
    .eq("tipo", "desbravador")
    .eq("ativo", true);

  if (membrosError) {
    console.error("Erro ao buscar membros da unidade:", membrosError);
    return defaults;
  }

  if (!membros || membros.length === 0) {
    return { ...defaults, totalEncontros: encontroIds.length };
  }

  const membroIds = (membros as Record<string, unknown>[]).map(
    (m) => m.id as string
  );

  // 3. Get presencas for these members in these encontros
  const { data: presencas, error: presencasError } = await db
    .from("presencas")
    .select("status, tem_material, tem_uniforme")
    .in("encontro_id", encontroIds)
    .in("membro_id", membroIds);

  if (presencasError) {
    console.error("Erro ao buscar presenças:", presencasError);
    return { ...defaults, totalEncontros: encontroIds.length };
  }

  const lista = (presencas || []) as Record<string, unknown>[];
  const total = lista.length;

  if (total === 0) {
    return { ...defaults, totalEncontros: encontroIds.length };
  }

  // 4. Calculate percentages
  const presentes = lista.filter(
    (p) => p.status === "pontual" || p.status === "atrasado"
  ).length;
  const pontuais = lista.filter((p) => p.status === "pontual").length;
  const comMaterial = lista.filter((p) => p.tem_material === true).length;
  const comUniforme = lista.filter((p) => p.tem_uniforme === true).length;

  return {
    taxaPresenca: Math.round((presentes / total) * 100),
    taxaPontualidade: Math.round((pontuais / total) * 100),
    taxaMaterial: Math.round((comMaterial / total) * 100),
    taxaUniforme: Math.round((comUniforme / total) * 100),
    totalEncontros: encontroIds.length,
  };
}

/**
 * Returns members with most absences in the last 3 finalized meetings.
 */
export async function getMembrosComMaisFaltas(
  unidadeId: string,
  limite: number = 5
): Promise<MembroComFaltas[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 1. Get last 3 finalized encontros
  const { data: encontros, error: encontrosError } = await db
    .from("encontros")
    .select("id")
    .eq("status", "finalizado")
    .order("data", { ascending: false })
    .limit(3);

  if (encontrosError) {
    console.error("Erro ao buscar encontros:", encontrosError);
    return [];
  }

  if (!encontros || encontros.length === 0) {
    return [];
  }

  const encontroIds = (encontros as Record<string, unknown>[]).map(
    (e) => e.id as string
  );
  const totalEncontros = encontroIds.length;

  // 2. Get unit members
  const { data: membros, error: membrosError } = await db
    .from("membros")
    .select("id, nome")
    .eq("unidade_id", unidadeId)
    .eq("tipo", "desbravador")
    .eq("ativo", true);

  if (membrosError) {
    console.error("Erro ao buscar membros:", membrosError);
    return [];
  }

  if (!membros || membros.length === 0) {
    return [];
  }

  const membroIds = (membros as Record<string, unknown>[]).map(
    (m) => m.id as string
  );

  // 3. Get presencas for these members in those encontros
  const { data: presencas, error: presencasError } = await db
    .from("presencas")
    .select("membro_id, status")
    .in("encontro_id", encontroIds)
    .in("membro_id", membroIds);

  if (presencasError) {
    console.error("Erro ao buscar presenças:", presencasError);
    return [];
  }

  // 4. Count faltas per member
  const faltasPorMembro = new Map<string, number>();
  (presencas || []).forEach((p: Record<string, unknown>) => {
    const status = p.status as string;
    if (status === "falta" || status === "falta_justificada") {
      const membroId = p.membro_id as string;
      faltasPorMembro.set(membroId, (faltasPorMembro.get(membroId) || 0) + 1);
    }
  });

  // Also count members with no presence records as having faltas
  const membroComPresenca = new Set(
    (presencas || []).map((p: Record<string, unknown>) => p.membro_id as string)
  );

  const membroMap = new Map<string, string>();
  (membros as Record<string, unknown>[]).forEach((m) => {
    membroMap.set(m.id as string, m.nome as string);
  });

  // Build result: members who have faltas (including those with no records)
  const resultado: MembroComFaltas[] = [];

  membroMap.forEach((nome, membroId) => {
    // Count faltas from presencas records
    const faltasRegistradas = faltasPorMembro.get(membroId) || 0;

    // Count encontros where member has no record at all (also counts as falta)
    const presencasDoMembro = (presencas || []).filter(
      (p: Record<string, unknown>) => p.membro_id === membroId
    ).length;
    const encontrosSemRegistro = totalEncontros - presencasDoMembro;

    const totalFaltas = faltasRegistradas + encontrosSemRegistro;

    if (totalFaltas > 0) {
      resultado.push({
        membroId,
        membroNome: nome,
        totalFaltas,
        totalEncontros,
      });
    }
  });

  // Sort by totalFaltas desc and limit
  return resultado
    .sort((a, b) => b.totalFaltas - a.totalFaltas)
    .slice(0, limite);
}

/**
 * Returns mensalidade summary for unit members in a given month/year.
 * Includes both desbravadores and conselheiros with per-group breakdown.
 */
export async function getResumoMensalidadesUnidade(
  unidadeId: string,
  mes: number,
  ano: number
): Promise<ResumoMensalidadesUnidade> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const emptyGrupo: ResumoMensalidadesGrupo = { total: 0, emDia: 0, pendentes: 0, isentos: 0 };
  const emptyResult: ResumoMensalidadesUnidade = {
    totalMembros: 0, emDia: 0, pendentes: 0, isentos: 0,
    desbravadores: { ...emptyGrupo },
    conselheiros: { ...emptyGrupo },
  };

  // 1a. Get desbravadores directly from membros (RLS allows via unidade_id)
  const { data: desbData, error: desbError } = await db
    .from("membros")
    .select("id, isento_mensalidade")
    .eq("unidade_id", unidadeId)
    .eq("tipo", "desbravador")
    .eq("ativo", true);

  if (desbError) {
    console.error("Erro ao buscar desbravadores:", desbError);
    throw new Error("Erro ao buscar desbravadores da unidade");
  }

  // 1b. Get conselheiros through conselheiros_unidades JOIN (bypasses membros RLS)
  const { data: consData, error: consError } = await db
    .from("conselheiros_unidades")
    .select("membro_id, membros (id, isento_mensalidade)")
    .eq("unidade_id", unidadeId);

  if (consError) {
    console.error("Erro ao buscar conselheiros:", consError);
    throw new Error("Erro ao buscar conselheiros da unidade");
  }

  const desbMembros = (desbData || []) as { id: string; isento_mensalidade: boolean }[];
  const consMembros = ((consData || []) as Record<string, unknown>[])
    .map((c) => c.membros as { id: string; isento_mensalidade: boolean } | null)
    .filter((m): m is { id: string; isento_mensalidade: boolean } => m !== null);

  const totalMembros = desbMembros.length + consMembros.length;

  if (totalMembros === 0) {
    return emptyResult;
  }

  // 2. Count isentos per group
  const desbIsentos = desbMembros.filter((m) => m.isento_mensalidade === true).length;
  const consIsentos = consMembros.filter((m) => m.isento_mensalidade === true).length;
  const isentos = desbIsentos + consIsentos;

  // 3. Get non-exempt member IDs per group
  const desbNaoIsentoIds = desbMembros
    .filter((m) => m.isento_mensalidade !== true)
    .map((m) => m.id);
  const consNaoIsentoIds = consMembros
    .filter((m) => m.isento_mensalidade !== true)
    .map((m) => m.id);
  const naoIsentoIds = [...desbNaoIsentoIds, ...consNaoIsentoIds];

  if (naoIsentoIds.length === 0) {
    return {
      totalMembros, emDia: 0, pendentes: 0, isentos,
      desbravadores: { total: desbMembros.length, emDia: 0, pendentes: 0, isentos: desbIsentos },
      conselheiros: { total: consMembros.length, emDia: 0, pendentes: 0, isentos: consIsentos },
    };
  }

  // 4. Get mensalidades for these members this month/year
  const { data: mensalidades, error: mensalidadesError } = await db
    .from("mensalidades")
    .select("membro_id, status")
    .eq("mes", mes)
    .eq("ano", ano)
    .in("membro_id", naoIsentoIds);

  if (mensalidadesError) {
    console.error("Erro ao buscar mensalidades:", mensalidadesError);
    throw new Error("Erro ao buscar mensalidades da unidade");
  }

  const mensalidadeMap = new Map<string, string>();
  (mensalidades || []).forEach((m: Record<string, unknown>) => {
    mensalidadeMap.set(m.membro_id as string, m.status as string);
  });

  // 5. Calculate per-group stats
  let desbEmDia = 0, desbPendentes = 0;
  desbNaoIsentoIds.forEach((membroId) => {
    if (mensalidadeMap.get(membroId) === "pago") desbEmDia++;
    else desbPendentes++;
  });

  let consEmDia = 0, consPendentes = 0;
  consNaoIsentoIds.forEach((membroId) => {
    if (mensalidadeMap.get(membroId) === "pago") consEmDia++;
    else consPendentes++;
  });

  const emDia = desbEmDia + consEmDia;
  const pendentes = desbPendentes + consPendentes;

  return {
    totalMembros, emDia, pendentes, isentos,
    desbravadores: {
      total: desbMembros.length,
      emDia: desbEmDia,
      pendentes: desbPendentes,
      isentos: desbIsentos,
    },
    conselheiros: {
      total: consMembros.length,
      emDia: consEmDia,
      pendentes: consPendentes,
      isentos: consIsentos,
    },
  };
}

/**
 * Returns unit members with pending mensalidades.
 * Includes both desbravadores and conselheiros linked to the unit.
 */
export async function getMembrosInadimplentesUnidade(
  unidadeId: string
): Promise<MembroInadimplente[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 1a. Get non-exempt desbravadores directly (RLS allows via unidade_id)
  const { data: desbData, error: desbError } = await db
    .from("membros")
    .select("id, nome")
    .eq("unidade_id", unidadeId)
    .eq("tipo", "desbravador")
    .eq("ativo", true)
    .eq("isento_mensalidade", false);

  if (desbError) {
    console.error("Erro ao buscar desbravadores:", desbError);
    throw new Error("Erro ao buscar desbravadores da unidade");
  }

  // 1b. Get conselheiros through conselheiros_unidades JOIN (bypasses membros RLS)
  const { data: consData, error: consError } = await db
    .from("conselheiros_unidades")
    .select("membro_id, membros (id, nome, isento_mensalidade)")
    .eq("unidade_id", unidadeId);

  if (consError) {
    console.error("Erro ao buscar conselheiros:", consError);
    throw new Error("Erro ao buscar conselheiros da unidade");
  }

  // Build combined member map (id -> nome), filtering out isentos for conselheiros
  const membroMap = new Map<string, string>();
  ((desbData || []) as Record<string, unknown>[]).forEach((m) => {
    membroMap.set(m.id as string, m.nome as string);
  });
  ((consData || []) as Record<string, unknown>[]).forEach((c) => {
    const membro = c.membros as Record<string, unknown> | null;
    if (membro && membro.isento_mensalidade !== true) {
      membroMap.set(membro.id as string, membro.nome as string);
    }
  });

  if (membroMap.size === 0) {
    return [];
  }

  const membroIds = Array.from(membroMap.keys());

  // 2. Get all pending mensalidades for these members
  const { data: mensalidades, error: mensalidadesError } = await db
    .from("mensalidades")
    .select("membro_id, mes, ano")
    .eq("status", "pendente")
    .in("membro_id", membroIds)
    .order("ano")
    .order("mes");

  if (mensalidadesError) {
    console.error("Erro ao buscar mensalidades pendentes:", mensalidadesError);
    throw new Error("Erro ao buscar mensalidades pendentes");
  }

  if (!mensalidades || mensalidades.length === 0) {
    return [];
  }

  // 3. Group by member
  const porMembro = new Map<string, string[]>();
  (mensalidades as Record<string, unknown>[]).forEach((m) => {
    const membroId = m.membro_id as string;
    const mes = m.mes as number;
    const ano = m.ano as number;
    const label = `${MESES_ABREVIADOS[mes]}/${ano}`;

    if (!porMembro.has(membroId)) {
      porMembro.set(membroId, []);
    }
    porMembro.get(membroId)!.push(label);
  });

  // 4. Build result sorted by number of pending months desc
  return Array.from(porMembro.entries())
    .map(([membroId, mesesPendentes]) => ({
      membroId,
      membroNome: membroMap.get(membroId) || "",
      mesesPendentes,
    }))
    .sort((a, b) => b.mesesPendentes.length - a.mesesPendentes.length);
}

/**
 * Returns presence history for the unit with per-encontro and per-membro data.
 */
export async function getHistoricoPresencasUnidade(
  unidadeId: string,
  periodo: "30d" | "3m" | "6m" | "1a"
): Promise<HistoricoPresencasResult> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const emptyResult: HistoricoPresencasResult = {
    encontros: [],
    membros: [],
    resumo: {
      totalEncontros: 0,
      mediaPresenca: 0,
      mediaPontualidade: 0,
      membroMaisPresente: "",
      membroMaisFaltas: "",
    },
  };

  // 1. Calculate date range based on periodo
  const agora = new Date();
  const dataLimite = new Date();

  switch (periodo) {
    case "30d":
      dataLimite.setDate(agora.getDate() - 30);
      break;
    case "3m":
      dataLimite.setMonth(agora.getMonth() - 3);
      break;
    case "6m":
      dataLimite.setMonth(agora.getMonth() - 6);
      break;
    case "1a":
      dataLimite.setFullYear(agora.getFullYear() - 1);
      break;
  }

  const dataInicio = dataLimite.toISOString().split("T")[0];

  // 2. Get finalized encontros in range
  const { data: encontros, error: encontrosError } = await db
    .from("encontros")
    .select("id, data, descricao")
    .eq("status", "finalizado")
    .gte("data", dataInicio)
    .order("data", { ascending: false });

  if (encontrosError) {
    console.error("Erro ao buscar encontros:", encontrosError);
    return emptyResult;
  }

  if (!encontros || encontros.length === 0) {
    return emptyResult;
  }

  const encontroIds = (encontros as Record<string, unknown>[]).map(
    (e) => e.id as string
  );

  // 3. Get unit members
  const { data: membros, error: membrosError } = await db
    .from("membros")
    .select("id, nome")
    .eq("unidade_id", unidadeId)
    .eq("tipo", "desbravador")
    .eq("ativo", true)
    .order("nome");

  if (membrosError) {
    console.error("Erro ao buscar membros:", membrosError);
    return emptyResult;
  }

  if (!membros || membros.length === 0) {
    return { ...emptyResult, resumo: { ...emptyResult.resumo, totalEncontros: encontros.length } };
  }

  const membroIds = (membros as Record<string, unknown>[]).map(
    (m) => m.id as string
  );

  // 4. Get presencas for these members in these encontros
  const { data: presencas, error: presencasError } = await db
    .from("presencas")
    .select("encontro_id, membro_id, status, tem_material, tem_uniforme")
    .in("encontro_id", encontroIds)
    .in("membro_id", membroIds);

  if (presencasError) {
    console.error("Erro ao buscar presenças:", presencasError);
    return emptyResult;
  }

  const listaPresencas = (presencas || []) as Record<string, unknown>[];

  // Build presencas indexed by encontro_id
  const presencasPorEncontro = new Map<string, Record<string, unknown>[]>();
  listaPresencas.forEach((p) => {
    const eid = p.encontro_id as string;
    if (!presencasPorEncontro.has(eid)) {
      presencasPorEncontro.set(eid, []);
    }
    presencasPorEncontro.get(eid)!.push(p);
  });

  // Build presencas indexed by membro_id
  const presencasPorMembro = new Map<string, Record<string, unknown>[]>();
  listaPresencas.forEach((p) => {
    const mid = p.membro_id as string;
    if (!presencasPorMembro.has(mid)) {
      presencasPorMembro.set(mid, []);
    }
    presencasPorMembro.get(mid)!.push(p);
  });

  // Membro name map
  const membroNomeMap = new Map<string, string>();
  (membros as Record<string, unknown>[]).forEach((m) => {
    membroNomeMap.set(m.id as string, m.nome as string);
  });

  // 5a. Build encontros view
  const encontrosResult = (encontros as Record<string, unknown>[]).map((e) => {
    const eid = e.id as string;
    const presencasDoEncontro = presencasPorEncontro.get(eid) || [];

    const presentes = presencasDoEncontro.filter(
      (p) => p.status === "pontual" || p.status === "atrasado"
    ).length;
    const faltas = presencasDoEncontro.filter(
      (p) => p.status === "falta" || p.status === "falta_justificada"
    ).length;
    const totalRegistros = presencasDoEncontro.length;

    const detalhes = presencasDoEncontro.map((p) => ({
      membroId: p.membro_id as string,
      membroNome: membroNomeMap.get(p.membro_id as string) || "",
      status: p.status as string,
      temMaterial: (p.tem_material as boolean) || false,
      temUniforme: (p.tem_uniforme as boolean) || false,
    }));

    return {
      encontroId: eid,
      data: e.data as string,
      descricao: e.descricao as string | undefined,
      presentes,
      faltas,
      percentualPresenca:
        totalRegistros > 0 ? Math.round((presentes / totalRegistros) * 100) : 0,
      detalhes,
    };
  });

  // 5b. Build membros view
  const membrosResult = (membros as Record<string, unknown>[]).map((m) => {
    const mid = m.id as string;
    const presencasDoMembro = presencasPorMembro.get(mid) || [];

    const totalPresencas = presencasDoMembro.filter(
      (p) => p.status === "pontual" || p.status === "atrasado"
    ).length;
    const totalFaltas = presencasDoMembro.filter(
      (p) => p.status === "falta" || p.status === "falta_justificada"
    ).length;
    const totalRegistros = presencasDoMembro.length;

    // Build encontro map for this member
    const encontroMap = new Map<string, Record<string, unknown>>();
    presencasDoMembro.forEach((p) => {
      encontroMap.set(p.encontro_id as string, p);
    });

    const historico = (encontros as Record<string, unknown>[]).map((e) => {
      const p = encontroMap.get(e.id as string);
      return {
        encontroId: e.id as string,
        data: e.data as string,
        status: p ? (p.status as string) : "sem_registro",
      };
    });

    return {
      membroId: mid,
      membroNome: m.nome as string,
      totalPresencas,
      totalFaltas,
      percentualPresenca:
        totalRegistros > 0 ? Math.round((totalPresencas / totalRegistros) * 100) : 0,
      historico,
    };
  });

  // 5c. Build resumo
  const totalEncontros = encontros.length;
  const totalPresencasGeral = listaPresencas.filter(
    (p) => p.status === "pontual" || p.status === "atrasado"
  ).length;
  const totalPontuaisGeral = listaPresencas.filter(
    (p) => p.status === "pontual"
  ).length;
  const totalRegistrosGeral = listaPresencas.length;

  // Find membro with most presencas and most faltas
  let membroMaisPresente = "";
  let maxPresencas = -1;
  let membroMaisFaltas = "";
  let maxFaltas = -1;

  membrosResult.forEach((m) => {
    if (m.totalPresencas > maxPresencas) {
      maxPresencas = m.totalPresencas;
      membroMaisPresente = m.membroNome;
    }
    if (m.totalFaltas > maxFaltas) {
      maxFaltas = m.totalFaltas;
      membroMaisFaltas = m.membroNome;
    }
  });

  return {
    encontros: encontrosResult,
    membros: membrosResult,
    resumo: {
      totalEncontros,
      mediaPresenca:
        totalRegistrosGeral > 0
          ? Math.round((totalPresencasGeral / totalRegistrosGeral) * 100)
          : 0,
      mediaPontualidade:
        totalRegistrosGeral > 0
          ? Math.round((totalPontuaisGeral / totalRegistrosGeral) * 100)
          : 0,
      membroMaisPresente,
      membroMaisFaltas,
    },
  };
}

/**
 * Returns member details including class history and presence history
 * for the conselheiro view.
 */
export async function getMembroDetalhesConselheiro(
  membroId: string,
  unidadeId: string
): Promise<MembroDetalhesConselheiro | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 1. Get member basic data
  const { data: membro, error: membroError } = await db
    .from("membros")
    .select(`
      id,
      nome,
      data_nascimento,
      tipo,
      telefone,
      responsavel,
      telefone_responsavel,
      isento_mensalidade,
      classe_id,
      unidade_id,
      classes (
        id,
        nome
      ),
      unidades (
        id,
        nome
      )
    `)
    .eq("id", membroId)
    .single();

  if (membroError) {
    if (membroError.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar membro:", membroError);
    throw new Error("Erro ao buscar detalhes do membro");
  }

  if (!membro) {
    return null;
  }

  // Verify member belongs to the unit (via unidade_id or via conselheiros_unidades)
  if (membro.unidade_id !== unidadeId) {
    const { data: vinculoConselheiro } = await db
      .from("conselheiros_unidades")
      .select("id")
      .eq("membro_id", membroId)
      .eq("unidade_id", unidadeId)
      .limit(1);

    if (!vinculoConselheiro || vinculoConselheiro.length === 0) {
      return null;
    }
  }

  const classes = membro.classes as Record<string, unknown> | null;
  const unidades = membro.unidades as Record<string, unknown> | null;

  // 2. Get class history
  const { data: historicoClasses, error: historicoError } = await db
    .from("historico_classes")
    .select(`
      ano,
      classes (
        nome
      )
    `)
    .eq("membro_id", membroId)
    .order("ano", { ascending: false });

  if (historicoError) {
    console.error("Erro ao buscar histórico de classes:", historicoError);
  }

  const historicoClassesList = (historicoClasses || []).map(
    (h: Record<string, unknown>) => {
      const classeData = h.classes as Record<string, unknown> | null;
      return {
        classeNome: classeData?.nome as string || "",
        ano: h.ano as number,
      };
    }
  );

  // 3. Get last 10 presencas with encontro data
  const { data: presencas, error: presencasError } = await db
    .from("presencas")
    .select(`
      status,
      tem_material,
      tem_uniforme,
      encontros (
        data
      )
    `)
    .eq("membro_id", membroId)
    .order("criado_em", { ascending: false })
    .limit(10);

  if (presencasError) {
    console.error("Erro ao buscar presenças do membro:", presencasError);
  }

  const ultimasPresencas = (presencas || []).map(
    (p: Record<string, unknown>) => {
      const encontro = p.encontros as Record<string, unknown> | null;
      return {
        data: encontro?.data as string || "",
        status: p.status as string,
        temMaterial: (p.tem_material as boolean) || false,
        temUniforme: (p.tem_uniforme as boolean) || false,
      };
    }
  );

  // 4. Calculate statistics from all presencas
  const { data: todasPresencas, error: todasPresencasError } = await db
    .from("presencas")
    .select("status, tem_material, tem_uniforme")
    .eq("membro_id", membroId);

  if (todasPresencasError) {
    console.error("Erro ao buscar todas as presenças:", todasPresencasError);
  }

  const lista = (todasPresencas || []) as Record<string, unknown>[];
  const totalRegistros = lista.length;
  let taxaPresenca = 0;
  let taxaPontualidade = 0;
  let taxaMaterial = 0;
  let taxaUniforme = 0;

  if (totalRegistros > 0) {
    const presentes = lista.filter(
      (p) => p.status === "pontual" || p.status === "atrasado"
    ).length;
    const pontuais = lista.filter((p) => p.status === "pontual").length;
    const comMaterial = lista.filter((p) => p.tem_material === true).length;
    const comUniforme = lista.filter((p) => p.tem_uniforme === true).length;

    taxaPresenca = Math.round((presentes / totalRegistros) * 100);
    taxaPontualidade = Math.round((pontuais / totalRegistros) * 100);
    taxaMaterial = Math.round((comMaterial / totalRegistros) * 100);
    taxaUniforme = Math.round((comUniforme / totalRegistros) * 100);
  }

  // 5. Get mensalidade status for current month
  let statusMensalidade: "em_dia" | "pendente" | "isento" | undefined;

  if (membro.isento_mensalidade === true) {
    statusMensalidade = "isento";
  } else {
    const agora = new Date();
    const mesAtual = agora.getMonth() + 1;
    const anoAtual = agora.getFullYear();

    const { data: mensalidade } = await db
      .from("mensalidades")
      .select("status")
      .eq("membro_id", membroId)
      .eq("mes", mesAtual)
      .eq("ano", anoAtual)
      .single();

    if (mensalidade) {
      statusMensalidade = mensalidade.status === "pago" ? "em_dia" : "pendente";
    } else {
      statusMensalidade = "pendente";
    }
  }

  return {
    id: membro.id as string,
    nome: membro.nome as string,
    dataNascimento: membro.data_nascimento as string | undefined,
    tipo: membro.tipo as string,
    telefone: membro.telefone as string | undefined,
    responsavel: membro.responsavel as string | undefined,
    telefoneResponsavel: membro.telefone_responsavel as string | undefined,
    classe: classes
      ? { id: classes.id as string, nome: classes.nome as string }
      : undefined,
    unidade: unidades
      ? { id: unidades.id as string, nome: unidades.nome as string }
      : undefined,
    historicoClasses: historicoClassesList,
    ultimasPresencas,
    estatisticas: {
      taxaPresenca,
      taxaPontualidade,
      taxaMaterial,
      taxaUniforme,
    },
    statusMensalidade,
  };
}
