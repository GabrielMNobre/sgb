import { createClient } from "@/lib/supabase/server";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type {
  Campeonato,
  AvaliacaoCampeonato,
  AvaliacaoFormData,
  DemeritoCampeonato,
  DemeritoFormData,
  AcompanhamentoClasses,
  ClassesFormData,
  DashboardConselheiro,
  HistoricoItem,
  MetaCampeonato,
  RankingItem,
  DashboardExecutivo,
  AtividadeItem,
  StatusClasseItem,
} from "@/types/campeonato";
import { DEMERITOS_CONFIG } from "@/types/campeonato";

// ─── Campeonato Ativo ──────────────────────────────────────────────────────────

export async function getCampeonatoAtivo(): Promise<Campeonato | null> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("campeonatos")
    .select("*")
    .eq("status", "ativo")
    .order("ano", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar campeonato ativo:", error);
    return null;
  }

  return snakeToCamel<Campeonato>(data);
}

export async function getCampeonatoById(id: string): Promise<Campeonato | null> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("campeonatos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar campeonato:", error);
    return null;
  }

  return snakeToCamel<Campeonato>(data);
}

// ─── Dashboard Conselheiro ─────────────────────────────────────────────────────

export async function getDashboardConselheiro(
  campeonatoId: string,
  unidadeId: string
): Promise<DashboardConselheiro> {
  const supabase = await createClient();
  const db = supabase as any;

  const hoje = new Date().toISOString().split("T")[0];

  // Ranking da unidade para total de pontos
  const { data: ranking } = await db
    .from("ranking_campeonatos")
    .select("pontos_totais")
    .eq("campeonato_id", campeonatoId)
    .eq("unidade_id", unidadeId)
    .single();

  // Avaliações do dia
  const { data: avaliacoesDia } = await db
    .from("avaliacoes_campeonatos")
    .select("pontos")
    .eq("campeonato_id", campeonatoId)
    .eq("unidade_id", unidadeId)
    .eq("data_avaliacao", hoje);

  // Deméritos do dia
  const { data: demeritosDia } = await db
    .from("demeritos_campeonatos")
    .select("pontos_perdidos")
    .eq("campeonato_id", campeonatoId)
    .eq("unidade_id", unidadeId)
    .eq("data_ocorrencia", hoje);

  // Nome e cor da unidade
  const { data: unidade } = await db
    .from("unidades")
    .select("nome, cor_primaria")
    .eq("id", unidadeId)
    .single();

  const pontosDia = (avaliacoesDia || []).reduce(
    (sum: number, a: any) => sum + (a.pontos || 0),
    0
  );
  const demeritosPontos = (demeritosDia || []).reduce(
    (sum: number, d: any) => sum + Math.abs(d.pontos_perdidos || 0),
    0
  );

  return {
    unidadeNome: unidade?.nome || "",
    unidadeCor: unidade?.cor_primaria || "#1a2b5f",
    totalPontos: ranking?.pontos_totais || 0,
    pontosDia,
    demeritosDia: demeritosPontos,
    saldoDia: pontosDia - demeritosPontos,
  };
}

// ─── Detalhes do Dia ──────────────────────────────────────────────────────────

export interface DetalhesDia {
  avaliacoes: AvaliacaoCampeonato[];
  demeritos: DemeritoCampeonato[];
}

export async function getDetalhesdia(
  campeonatoId: string,
  unidadeId: string,
  data: string
): Promise<DetalhesDia> {
  const supabase = await createClient();
  const db = supabase as any;

  const [{ data: avaliacoes }, { data: demeritos }] = await Promise.all([
    db
      .from("avaliacoes_campeonatos")
      .select("*")
      .eq("campeonato_id", campeonatoId)
      .eq("unidade_id", unidadeId)
      .eq("data_avaliacao", data)
      .order("criado_em", { ascending: true }),
    db
      .from("demeritos_campeonatos")
      .select("*")
      .eq("campeonato_id", campeonatoId)
      .eq("unidade_id", unidadeId)
      .eq("data_ocorrencia", data)
      .order("criado_em", { ascending: true }),
  ]);

  return {
    avaliacoes: (avaliacoes || []).map((a: any) => snakeToCamel<AvaliacaoCampeonato>(a)),
    demeritos: (demeritos || []).map((d: any) => snakeToCamel<DemeritoCampeonato>(d)),
  };
}

// ─── Histórico 30 Dias ────────────────────────────────────────────────────────

export async function getHistorico30Dias(
  campeonatoId: string,
  unidadeId: string
): Promise<HistoricoItem[]> {
  const supabase = await createClient();
  const db = supabase as any;

  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
  const dataInicio = trintaDiasAtras.toISOString().split("T")[0];

  const [{ data: avaliacoes }, { data: demeritos }] = await Promise.all([
    db
      .from("avaliacoes_campeonatos")
      .select("data_avaliacao, categoria, tipo_avaliacao, cor, pontos")
      .eq("campeonato_id", campeonatoId)
      .eq("unidade_id", unidadeId)
      .gte("data_avaliacao", dataInicio)
      .order("data_avaliacao", { ascending: false }),
    db
      .from("demeritos_campeonatos")
      .select("data_ocorrencia, tipo_demeritos, pontos_perdidos")
      .eq("campeonato_id", campeonatoId)
      .eq("unidade_id", unidadeId)
      .gte("data_ocorrencia", dataInicio)
      .order("data_ocorrencia", { ascending: false }),
  ]);

  // Agrupa por data para calcular total do dia
  const totaisPorData: Record<string, number> = {};

  (avaliacoes || []).forEach((a: any) => {
    const key = a.data_avaliacao;
    totaisPorData[key] = (totaisPorData[key] || 0) + (a.pontos || 0);
  });
  (demeritos || []).forEach((d: any) => {
    const key = d.data_ocorrencia;
    totaisPorData[key] = (totaisPorData[key] || 0) + (d.pontos_perdidos || 0);
  });

  const items: HistoricoItem[] = [];

  (avaliacoes || []).forEach((a: any) => {
    items.push({
      dataRegistro: a.data_avaliacao,
      tipoRegistro: "avaliacao",
      categoria: a.categoria,
      tipo: a.tipo_avaliacao,
      cor: a.cor,
      pontosGanhos: a.pontos || 0,
      pontosPerdidos: 0,
      totalDia: totaisPorData[a.data_avaliacao] || 0,
    });
  });

  (demeritos || []).forEach((d: any) => {
    items.push({
      dataRegistro: d.data_ocorrencia,
      tipoRegistro: "demeritos",
      tipo: d.tipo_demeritos,
      pontosGanhos: 0,
      pontosPerdidos: Math.abs(d.pontos_perdidos || 0),
      totalDia: totaisPorData[d.data_ocorrencia] || 0,
    });
  });

  // Ordena por data DESC
  items.sort((a, b) => b.dataRegistro.localeCompare(a.dataRegistro));

  return items;
}

// ─── Evolução Anual (para gráfico) ────────────────────────────────────────────

export interface EvolucaoMensal {
  mes: number;
  nomeMes: string;
  pontos: number;
  acumulado: number;
}

export async function getEvolucaoAnual(
  campeonatoId: string,
  unidadeId: string
): Promise<EvolucaoMensal[]> {
  const supabase = await createClient();
  const db = supabase as any;

  const meses = [
    { num: 2, nome: "Fev" },
    { num: 3, nome: "Mar" },
    { num: 4, nome: "Abr" },
    { num: 5, nome: "Mai" },
    { num: 6, nome: "Jun" },
    { num: 7, nome: "Jul" },
    { num: 8, nome: "Ago" },
    { num: 9, nome: "Set" },
    { num: 10, nome: "Out" },
    { num: 11, nome: "Nov" },
  ];

  const [{ data: avaliacoes }, { data: demeritos }] = await Promise.all([
    db
      .from("avaliacoes_campeonatos")
      .select("data_avaliacao, pontos")
      .eq("campeonato_id", campeonatoId)
      .eq("unidade_id", unidadeId),
    db
      .from("demeritos_campeonatos")
      .select("data_ocorrencia, pontos_perdidos")
      .eq("campeonato_id", campeonatoId)
      .eq("unidade_id", unidadeId),
  ]);

  const pontosPorMes: Record<number, number> = {};

  (avaliacoes || []).forEach((a: any) => {
    const mes = new Date(a.data_avaliacao + "T00:00:00").getMonth() + 1;
    pontosPorMes[mes] = (pontosPorMes[mes] || 0) + (a.pontos || 0);
  });
  (demeritos || []).forEach((d: any) => {
    const mes = new Date(d.data_ocorrencia + "T00:00:00").getMonth() + 1;
    pontosPorMes[mes] = (pontosPorMes[mes] || 0) + (d.pontos_perdidos || 0);
  });

  let acumulado = 0;
  return meses.map(({ num, nome }) => {
    const pontos = pontosPorMes[num] || 0;
    acumulado += pontos;
    return { mes: num, nomeMes: nome, pontos, acumulado };
  });
}

// ─── Metas ────────────────────────────────────────────────────────────────────

export async function getMetas(
  campeonatoId: string,
  unidadeId: string
): Promise<MetaCampeonato[]> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data: classes } = await db
    .from("acompanhamento_classes_campeonato")
    .select("*")
    .eq("campeonato_id", campeonatoId)
    .eq("unidade_id", unidadeId)
    .single();

  const hoje = new Date();
  const deadlineRegular = new Date("2026-06-28");
  const deadlineAvancada = new Date("2026-10-25");

  const metas: MetaCampeonato[] = [];

  // Classe Regular
  if (classes?.classe_regular_completada) {
    metas.push({
      nome: "Classe Regular",
      pontos: 200,
      status: "concluido",
      prazo: "2026-06-28",
    });
  } else if (hoje > deadlineRegular) {
    metas.push({
      nome: "Classe Regular",
      pontos: 200,
      status: "vencido",
      prazo: "2026-06-28",
    });
  } else {
    metas.push({
      nome: "Classe Regular",
      pontos: 200,
      status: "disponivel",
      prazo: "2026-06-28",
    });
  }

  // Classe Avançada
  if (classes?.classe_avancada_completada) {
    metas.push({
      nome: "Classe Avançada",
      pontos: 300,
      status: "concluido",
      prazo: "2026-10-25",
    });
  } else if (hoje > deadlineAvancada) {
    metas.push({
      nome: "Classe Avançada",
      pontos: 300,
      status: "vencido",
      prazo: "2026-10-25",
    });
  } else {
    metas.push({
      nome: "Classe Avançada",
      pontos: 300,
      status: "disponivel",
      prazo: "2026-10-25",
    });
  }

  // Classe Bíblica
  metas.push({
    nome: "Classe Bíblica",
    pontos: 200,
    status: classes?.classe_biblica_em_dia ? "em_dia" : "com_atraso",
  });

  // Especialidades
  const totalEsp = classes?.total_especialidades || 0;
  metas.push({
    nome: "Especialidades",
    pontos: Math.min(totalEsp, 20) * 100,
    status: "em_progresso",
    progresso: { atual: totalEsp, maximo: 20 },
  });

  return metas;
}

// ─── Ranking: Atualização de Pontos ───────────────────────────────────────────

// ─── Avaliações CRUD ──────────────────────────────────────────────────────────

export async function getAvaliacoes(
  campeonatoId: string,
  unidadeId: string,
  data: string
): Promise<AvaliacaoCampeonato[]> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data: avaliacoes, error } = await db
    .from("avaliacoes_campeonatos")
    .select("*")
    .eq("campeonato_id", campeonatoId)
    .eq("unidade_id", unidadeId)
    .eq("data_avaliacao", data)
    .order("criado_em", { ascending: true });

  if (error) {
    console.error("Erro ao buscar avaliações:", error);
    return [];
  }

  return (avaliacoes || []).map((a: any) => snakeToCamel<AvaliacaoCampeonato>(a));
}

export async function createAvaliacao(
  campeonatoId: string,
  formData: AvaliacaoFormData,
  criadaPor: string
): Promise<AvaliacaoCampeonato> {
  const supabase = await createClient();
  const db = supabase as any;

  // Validações de data
  const dataAvaliacao = new Date(formData.dataAvaliacao + "T00:00:00");
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  const inicio = new Date("2026-02-01");
  const fim = new Date("2026-11-30");

  if (dataAvaliacao > hoje) {
    throw new Error("Data não pode ser futura");
  }
  if (dataAvaliacao < inicio || dataAvaliacao > fim) {
    throw new Error("Data deve estar entre 01/02/2026 e 30/11/2026");
  }

  // Calcula pontos conforme cor
  const pontosPorCor = { verde: 50, amarelo: 30, vermelho: 10 };
  const pontos = pontosPorCor[formData.cor] || 10;

  const { data, error } = await db
    .from("avaliacoes_campeonatos")
    .insert({
      campeonato_id: campeonatoId,
      unidade_id: formData.unidadeId,
      data_avaliacao: formData.dataAvaliacao,
      categoria: formData.categoria,
      tipo_avaliacao: formData.tipoAvaliacao,
      cor: formData.cor,
      pontos,
      descricao: formData.descricao || null,
      criada_por: criadaPor,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar avaliação:", error);
    throw new Error("Erro ao registrar avaliação");
  }

  await sincronizarRanking(campeonatoId);

  return snakeToCamel<AvaliacaoCampeonato>(data);
}

export async function deleteAvaliacao(id: string): Promise<void> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data: registro } = await db
    .from("avaliacoes_campeonatos")
    .select("campeonato_id, unidade_id")
    .eq("id", id)
    .single();

  const { error } = await db
    .from("avaliacoes_campeonatos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar avaliação:", error);
    throw new Error("Erro ao deletar avaliação");
  }

  if (registro) {
    await sincronizarRanking(registro.campeonato_id);
  }
}

// ─── Deméritos CRUD ───────────────────────────────────────────────────────────

export async function getDemeritos(
  campeonatoId: string,
  unidadeId: string,
  data: string
): Promise<DemeritoCampeonato[]> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data: demeritos, error } = await db
    .from("demeritos_campeonatos")
    .select("*")
    .eq("campeonato_id", campeonatoId)
    .eq("unidade_id", unidadeId)
    .eq("data_ocorrencia", data)
    .order("criado_em", { ascending: true });

  if (error) {
    console.error("Erro ao buscar deméritos:", error);
    return [];
  }

  return (demeritos || []).map((d: any) => snakeToCamel<DemeritoCampeonato>(d));
}

export async function createDemerito(
  campeonatoId: string,
  formData: DemeritoFormData,
  registradoPor: string
): Promise<DemeritoCampeonato> {
  const supabase = await createClient();
  const db = supabase as any;

  // Validações de data
  const dataOcorrencia = new Date(formData.dataOcorrencia + "T00:00:00");
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  const inicio = new Date("2026-02-01");
  const fim = new Date("2026-11-30");

  if (dataOcorrencia > hoje) {
    throw new Error("Data não pode ser futura");
  }
  if (dataOcorrencia < inicio || dataOcorrencia > fim) {
    throw new Error("Data deve estar entre 01/02/2026 e 30/11/2026");
  }

  // Validação D3/D4 precisam de descrição
  const nivel = formData.tipoDemeritos.split("_")[0].toUpperCase();
  if ((nivel === "D3" || nivel === "D4") && !formData.descricao?.trim()) {
    throw new Error("Deméritos D3 e D4 requerem descrição obrigatória");
  }

  // Busca pontos do tipo
  const config = DEMERITOS_CONFIG.find((d) => d.value === formData.tipoDemeritos);
  const pontos = config?.pontos || -5;

  const { data, error } = await db
    .from("demeritos_campeonatos")
    .insert({
      campeonato_id: campeonatoId,
      unidade_id: formData.unidadeId,
      data_ocorrencia: formData.dataOcorrencia,
      tipo_demeritos: formData.tipoDemeritos,
      pontos_perdidos: pontos,
      descricao: formData.descricao || null,
      registrado_por: registradoPor,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar demérito:", error);
    throw new Error("Erro ao registrar demérito");
  }

  await sincronizarRanking(campeonatoId);

  return snakeToCamel<DemeritoCampeonato>(data);
}

export async function deleteDemerito(id: string): Promise<void> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data: registro } = await db
    .from("demeritos_campeonatos")
    .select("campeonato_id, unidade_id")
    .eq("id", id)
    .single();

  const { error } = await db
    .from("demeritos_campeonatos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar demérito:", error);
    throw new Error("Erro ao deletar demérito");
  }

  if (registro) {
    await sincronizarRanking(registro.campeonato_id);
  }
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

export async function getRankingCompleto(
  campeonatoId: string,
  filtroNome?: string
): Promise<RankingItem[]> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("ranking_campeonatos")
    .select(`
      *,
      unidades (
        id,
        nome,
        cor_primaria
      )
    `)
    .eq("campeonato_id", campeonatoId)
    .order("pontos_totais", { ascending: false });

  if (error) {
    console.error("Erro ao buscar ranking:", error);
    return [];
  }

  type RankingRow = { unidade_id: string; pontos_totais: number; unidades: { nome: string; cor_primaria: string } | null };

  let items: RankingItem[] = (data || []).map((row: RankingRow, index: number) => {
    const unidade = row.unidades;
    const posicao = index + 1;
    const badge =
      posicao === 1 ? "🥇" : posicao === 2 ? "🥈" : posicao === 3 ? "🥉" : "";

    return {
      posicao,
      unidadeId: row.unidade_id,
      unidadeNome: unidade?.nome || "",
      unidadeCor: unidade?.cor_primaria || "#1a2b5f",
      total: row.pontos_totais || 0,
      badge: badge as "🥇" | "🥈" | "🥉" | "",
    };
  });

  if (filtroNome) {
    const filtroLower = filtroNome.toLowerCase();
    items = items.filter((item) =>
      item.unidadeNome.toLowerCase().includes(filtroLower)
    );
  }

  return items;
}

// ─── Classes ──────────────────────────────────────────────────────────────────

export async function getClassesUnidade(
  campeonatoId: string,
  unidadeId: string
): Promise<AcompanhamentoClasses | null> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("acompanhamento_classes_campeonato")
    .select("*")
    .eq("campeonato_id", campeonatoId)
    .eq("unidade_id", unidadeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Cria registro se não existe
      const { data: novo, error: errNovo } = await db
        .from("acompanhamento_classes_campeonato")
        .insert({
          campeonato_id: campeonatoId,
          unidade_id: unidadeId,
          classe_regular_completada: false,
          classe_avancada_completada: false,
          classe_biblica_em_dia: false,
          total_especialidades: 0,
        })
        .select()
        .single();

      if (errNovo) {
        console.error("Erro ao criar registro de classes:", errNovo);
        return null;
      }
      return snakeToCamel<AcompanhamentoClasses>(novo);
    }
    console.error("Erro ao buscar classes:", error);
    return null;
  }

  return snakeToCamel<AcompanhamentoClasses>(data);
}

export async function updateClassesUnidade(
  campeonatoId: string,
  unidadeId: string,
  formData: ClassesFormData
): Promise<AcompanhamentoClasses> {
  const supabase = await createClient();
  const db = supabase as any;

  // Validações de datas
  if (formData.classeRegularCompletada && formData.dataConclusaoRegular) {
    const dataConc = new Date(formData.dataConclusaoRegular + "T00:00:00");
    const deadline = new Date("2026-06-28");
    if (dataConc > deadline) {
      throw new Error("Data de conclusão da Classe Regular deve ser até 28/06/2026");
    }
  }

  if (formData.classeAvancadaCompletada && formData.dataConclusaoAvancada) {
    const dataConc = new Date(formData.dataConclusaoAvancada + "T00:00:00");
    const deadline = new Date("2026-10-25");
    if (dataConc > deadline) {
      throw new Error("Data de conclusão da Classe Avançada deve ser até 25/10/2026");
    }
  }

  // Cap especialidades em 20
  const totalEsp = Math.min(Math.max(0, formData.totalEspecialidades), 20);

  const { data, error } = await db
    .from("acompanhamento_classes_campeonato")
    .upsert({
      campeonato_id: campeonatoId,
      unidade_id: unidadeId,
      classe_regular_completada: formData.classeRegularCompletada,
      data_conclusao_regular: formData.classeRegularCompletada
        ? (formData.dataConclusaoRegular || null)
        : null,
      classe_avancada_completada: formData.classeAvancadaCompletada,
      data_conclusao_avancada: formData.classeAvancadaCompletada
        ? (formData.dataConclusaoAvancada || null)
        : null,
      classe_biblica_em_dia: formData.classeBiblicaEmDia,
      total_especialidades: totalEsp,
      atualizado_em: new Date().toISOString(),
    }, {
      onConflict: "campeonato_id,unidade_id",
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar classes:", error);
    throw new Error("Erro ao atualizar classes");
  }

  await sincronizarRanking(campeonatoId);

  return snakeToCamel<AcompanhamentoClasses>(data);
}

// ─── Dashboard Executivo ──────────────────────────────────────────────────────

export async function getDashboardExecutivo(
  campeonatoId: string
): Promise<DashboardExecutivo> {
  const supabase = await createClient();
  const db = supabase as any;

  const hoje = new Date();
  const inicio = new Date("2026-02-01");
  const diasCampanha = Math.max(
    0,
    Math.floor((hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  );

  const [
    { count: totalAvaliacoes },
    { count: totalDemeritos },
    { data: top5 },
    { data: unidadesParticipantes },
  ] = await Promise.all([
    db
      .from("avaliacoes_campeonatos")
      .select("*", { count: "exact", head: true })
      .eq("campeonato_id", campeonatoId),
    db
      .from("demeritos_campeonatos")
      .select("*", { count: "exact", head: true })
      .eq("campeonato_id", campeonatoId),
    db
      .from("ranking_campeonatos")
      .select("pontos_totais, unidades(nome)")
      .eq("campeonato_id", campeonatoId)
      .order("pontos_totais", { ascending: false })
      .limit(6),
    db
      .from("ranking_campeonatos")
      .select("unidade_id")
      .eq("campeonato_id", campeonatoId),
  ]);

  return {
    totalAvaliacoes: totalAvaliacoes || 0,
    totalDemeritos: totalDemeritos || 0,
    unidadesParticipantes: (unidadesParticipantes || []).length,
    diasCampanha,
    top5: (top5 || []).map((r: any) => ({
      nome: r.unidades?.nome || "",
      pontos: r.pontos_totais || 0,
    })),
  };
}

export async function getAtividadeGeral(
  campeonatoId: string
): Promise<AtividadeItem[]> {
  const supabase = await createClient();
  const db = supabase as any;

  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
  const dataInicio = trintaDiasAtras.toISOString().split("T")[0];

  const [{ data: avaliacoes }, { data: demeritos }] = await Promise.all([
    db
      .from("avaliacoes_campeonatos")
      .select("data_avaliacao")
      .eq("campeonato_id", campeonatoId)
      .gte("data_avaliacao", dataInicio),
    db
      .from("demeritos_campeonatos")
      .select("data_ocorrencia")
      .eq("campeonato_id", campeonatoId)
      .gte("data_ocorrencia", dataInicio),
  ]);

  const porData: Record<string, { avaliacoes: number; demeritos: number }> = {};

  (avaliacoes || []).forEach((a: any) => {
    const key = a.data_avaliacao;
    if (!porData[key]) porData[key] = { avaliacoes: 0, demeritos: 0 };
    porData[key].avaliacoes++;
  });
  (demeritos || []).forEach((d: any) => {
    const key = d.data_ocorrencia;
    if (!porData[key]) porData[key] = { avaliacoes: 0, demeritos: 0 };
    porData[key].demeritos++;
  });

  return Object.entries(porData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, vals]) => ({
      data,
      numAvaliacoes: vals.avaliacoes,
      totalDemeritos: vals.demeritos,
    }));
}

export async function getStatusClasses(
  campeonatoId: string
): Promise<StatusClasseItem[]> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data: classes } = await db
    .from("acompanhamento_classes_campeonato")
    .select(
      "classe_regular_completada, classe_avancada_completada, classe_biblica_em_dia"
    )
    .eq("campeonato_id", campeonatoId);

  const total = (classes || []).length;
  if (total === 0) {
    return [
      { tipo: "regular", concluidas: 0, total: 0, percentual: 0 },
      { tipo: "avancada", concluidas: 0, total: 0, percentual: 0 },
      { tipo: "biblica", concluidas: 0, total: 0, percentual: 0 },
    ];
  }

  const regularConc = (classes || []).filter(
    (c: any) => c.classe_regular_completada
  ).length;
  const avancadaConc = (classes || []).filter(
    (c: any) => c.classe_avancada_completada
  ).length;
  const biblicaConc = (classes || []).filter(
    (c: any) => c.classe_biblica_em_dia
  ).length;

  return [
    {
      tipo: "regular",
      concluidas: regularConc,
      total,
      percentual: Math.round((regularConc / total) * 100),
    },
    {
      tipo: "avancada",
      concluidas: avancadaConc,
      total,
      percentual: Math.round((avancadaConc / total) * 100),
    },
    {
      tipo: "biblica",
      concluidas: biblicaConc,
      total,
      percentual: Math.round((biblicaConc / total) * 100),
    },
  ];
}

// ─── Inicialização do Campeonato ──────────────────────────────────────────────

export interface ResultadoInicializacao {
  unidadesProcessadas: number;
  rankingCriados: number;
  classesCriadas: number;
  erros: string[];
}

export async function inicializarCampeonato(
  campeonatoId: string
): Promise<ResultadoInicializacao> {
  const supabase = await createClient();
  const db = supabase as any;

  const resultado: ResultadoInicializacao = {
    unidadesProcessadas: 0,
    rankingCriados: 0,
    classesCriadas: 0,
    erros: [],
  };

  // 1. Busca todas as unidades ativas
  const { data: unidades, error: errUnidades } = await db
    .from("unidades")
    .select("id, nome")
    .eq("ativa", true)
    .order("nome");

  if (errUnidades || !unidades?.length) {
    resultado.erros.push("Nenhuma unidade ativa encontrada.");
    return resultado;
  }

  resultado.unidadesProcessadas = unidades.length;

  // 2. Busca registros já existentes para evitar duplicatas
  const [{ data: rankingExist }, { data: classesExist }] = await Promise.all([
    db
      .from("ranking_campeonatos")
      .select("unidade_id")
      .eq("campeonato_id", campeonatoId),
    db
      .from("acompanhamento_classes_campeonato")
      .select("unidade_id")
      .eq("campeonato_id", campeonatoId),
  ]);

  const rankingIds = new Set(
    (rankingExist || []).map((r: { unidade_id: string }) => r.unidade_id)
  );
  const classesIds = new Set(
    (classesExist || []).map((c: { unidade_id: string }) => c.unidade_id)
  );

  // 3. Cria ranking para unidades que ainda não têm
  const novoRanking = (unidades as { id: string; nome: string }[])
    .filter((u) => !rankingIds.has(u.id))
    .map((u) => ({
      campeonato_id: campeonatoId,
      unidade_id: u.id,
      pontos_totais: 0,
      posicao: 0,
    }));

  if (novoRanking.length > 0) {
    const { error: errRanking } = await db
      .from("ranking_campeonatos")
      .insert(novoRanking);

    if (errRanking) {
      resultado.erros.push(`Erro ao criar ranking: ${errRanking.message}`);
    } else {
      resultado.rankingCriados = novoRanking.length;
    }
  }

  // 4. Cria acompanhamento de classes para unidades que ainda não têm
  const novasClasses = (unidades as { id: string; nome: string }[])
    .filter((u) => !classesIds.has(u.id))
    .map((u) => ({
      campeonato_id: campeonatoId,
      unidade_id: u.id,
      classe_regular_completada: false,
      classe_avancada_completada: false,
      classe_biblica_em_dia: false,
      total_especialidades: 0,
    }));

  if (novasClasses.length > 0) {
    const { error: errClasses } = await db
      .from("acompanhamento_classes_campeonato")
      .insert(novasClasses);

    if (errClasses) {
      resultado.erros.push(`Erro ao criar classes: ${errClasses.message}`);
    } else {
      resultado.classesCriadas = novasClasses.length;
    }
  }

  // 5. Recalcula pontos de todas as unidades
  await sincronizarRanking(campeonatoId);

  return resultado;
}

// ─── Sincronizar Ranking via função do banco ───────────────────────────────────

export async function sincronizarRanking(campeonatoId: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 1. Busca entradas do ranking, avaliações, deméritos e classes em paralelo
  const [
    { data: rankingRows, error: errRanking },
    { data: avaliacoes },
    { data: demeritos },
    { data: classes },
  ] = await Promise.all([
    db
      .from("ranking_campeonatos")
      .select("unidade_id")
      .eq("campeonato_id", campeonatoId),
    db
      .from("avaliacoes_campeonatos")
      .select("unidade_id, pontos")
      .eq("campeonato_id", campeonatoId)
      .gt("pontos", 0),
    db
      .from("demeritos_campeonatos")
      .select("unidade_id, pontos_perdidos")
      .eq("campeonato_id", campeonatoId)
      .lt("pontos_perdidos", 0),
    db
      .from("acompanhamento_classes_campeonato")
      .select("unidade_id, classe_regular_completada, classe_avancada_completada, classe_biblica_em_dia, total_especialidades")
      .eq("campeonato_id", campeonatoId),
  ]);

  if (errRanking || !rankingRows?.length) {
    throw new Error("Nenhuma unidade no ranking para sincronizar");
  }

  // 2. Agrega pontos por unidade (replicando os SUMs do SQL)
  const avaliacaoMap: Record<string, number> = {};
  (avaliacoes || []).forEach((a: any) => {
    avaliacaoMap[a.unidade_id] = (avaliacaoMap[a.unidade_id] || 0) + (a.pontos || 0);
  });

  const demeritoMap: Record<string, number> = {};
  (demeritos || []).forEach((d: any) => {
    // pontos_perdidos já é negativo no banco; soma diretamente para subtrair
    demeritoMap[d.unidade_id] = (demeritoMap[d.unidade_id] || 0) + (d.pontos_perdidos || 0);
  });

  // 3. Calcula classes_pts (equivalente a calcular_pontos_classes)
  const classesMap: Record<string, number> = {};
  (classes || []).forEach((c: any) => {
    let pts = 0;
    if (c.classe_regular_completada) pts += 200;
    if (c.classe_avancada_completada) pts += 300;
    if (c.classe_biblica_em_dia) pts += 200;
    pts += Math.min(c.total_especialidades || 0, 20) * 100;
    classesMap[c.unidade_id] = pts;
  });

  // 4. Calcula pontos_totais = GREATEST(0, avaliacao + demerito_negativo_invertido + classes)
  const atualizacoes = (rankingRows as { unidade_id: string }[]).map((row) => ({
    unidade_id: row.unidade_id,
    pontos_totais: Math.max(
      0,
      (avaliacaoMap[row.unidade_id] || 0) +
      (demeritoMap[row.unidade_id] || 0) +
      (classesMap[row.unidade_id] || 0)
    ),
  }));

  // 5. Ordena por pontos DESC para calcular posições (ROW_NUMBER)
  atualizacoes.sort((a, b) => b.pontos_totais - a.pontos_totais || a.unidade_id.localeCompare(b.unidade_id));

  // 6. Atualiza pontos_totais e posicao de cada unidade
  const resultados = await Promise.all(
    atualizacoes.map((u, idx) =>
      db
        .from("ranking_campeonatos")
        .update({
          pontos_totais: u.pontos_totais,
          posicao: idx + 1,
        })
        .eq("campeonato_id", campeonatoId)
        .eq("unidade_id", u.unidade_id)
    )
  );

  const erros = resultados
    .map((r: any, i: number) => r.error ? `unidade ${atualizacoes[i].unidade_id}: ${r.error.message}` : null)
    .filter(Boolean);

  if (erros.length > 0) {
    throw new Error(`Erros ao atualizar ranking: ${erros.join("; ")}`);
  }
}
