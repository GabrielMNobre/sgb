import { createClient } from "@/lib/supabase/server";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type {
  PresencaComMembro,
  PresencaFormItem,
  ResumoPresencaEncontro,
  ResumoPresencaUnidade,
  ResumoDiretoria,
} from "@/types/encontro";

export async function upsertPresencas(
  encontroId: string,
  presencas: PresencaFormItem[],
  registradoPor: string
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  for (const p of presencas) {
    // Verificar se já existe presença para este membro neste encontro
    const { data: existente } = await db
      .from("presencas")
      .select("id")
      .eq("encontro_id", encontroId)
      .eq("membro_id", p.membroId)
      .single();

    if (existente) {
      // Atualizar
      const { error } = await db
        .from("presencas")
        .update({
          status: p.status,
          tem_material: p.temMaterial,
          tem_uniforme: p.temUniforme,
          observacao: p.observacao || null,
          registrado_por: registradoPor,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", existente.id);

      if (error) {
        console.error("Erro ao atualizar presença:", error);
        throw new Error("Erro ao salvar chamada");
      }
    } else {
      // Inserir
      const { error } = await db
        .from("presencas")
        .insert({
          encontro_id: encontroId,
          membro_id: p.membroId,
          status: p.status,
          tem_material: p.temMaterial,
          tem_uniforme: p.temUniforme,
          observacao: p.observacao || null,
          registrado_por: registradoPor,
        });

      if (error) {
        console.error("Erro ao inserir presença:", error);
        throw new Error("Erro ao salvar chamada");
      }
    }
  }
}

export async function getMembrosParaChamada(
  encontroId: string,
  unidadeId?: string,
  tipo?: "diretoria"
): Promise<PresencaComMembro[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 1. Buscar membros ativos
  let membrosQuery = db
    .from("membros")
    .select(`
      id,
      nome,
      tipo,
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
    .eq("ativo", true)
    .order("nome");

  if (tipo === "diretoria") {
    membrosQuery = membrosQuery.eq("tipo", "diretoria");
  } else if (unidadeId) {
    membrosQuery = membrosQuery.eq("unidade_id", unidadeId);
  }

  const { data: membros, error: membrosError } = await membrosQuery;

  if (membrosError) {
    console.error("Erro ao buscar membros:", membrosError);
    throw new Error("Erro ao buscar membros para chamada");
  }

  // 2. Buscar presenças existentes para este encontro
  const { data: presencas, error: presencasError } = await db
    .from("presencas")
    .select("*")
    .eq("encontro_id", encontroId);

  if (presencasError) {
    console.error("Erro ao buscar presenças:", presencasError);
    throw new Error("Erro ao buscar presenças");
  }

  // 3. Criar mapa de presenças por membro_id
  const presencaMap = new Map<string, Record<string, unknown>>();
  (presencas || []).forEach((p: Record<string, unknown>) => {
    presencaMap.set(p.membro_id as string, p);
  });

  // 4. Merge
  return (membros || []).map((m: Record<string, unknown>) => {
    const presenca = presencaMap.get(m.id as string);
    const classes = m.classes as Record<string, unknown> | null;
    const unidades = m.unidades as Record<string, unknown> | null;

    return {
      id: presenca ? (presenca.id as string) : undefined,
      encontroId,
      membroId: m.id as string,
      status: presenca ? (presenca.status as PresencaComMembro["status"]) : "falta",
      temMaterial: presenca ? (presenca.tem_material as boolean) : false,
      temUniforme: presenca ? (presenca.tem_uniforme as boolean) : false,
      observacao: presenca ? (presenca.observacao as string | undefined) : undefined,
      membro: {
        id: m.id as string,
        nome: m.nome as string,
        tipo: m.tipo as string,
        classe: classes
          ? { id: classes.id as string, nome: classes.nome as string }
          : undefined,
        unidade: unidades
          ? { id: unidades.id as string, nome: unidades.nome as string }
          : undefined,
      },
    };
  });
}

export async function getResumoPresenca(encontroId: string): Promise<ResumoPresencaEncontro> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Total membros ativos
  const { count: totalMembros } = await supabase
    .from("membros")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true);

  // Presenças do encontro
  const { data: presencas } = await db
    .from("presencas")
    .select("status, tem_material, tem_uniforme")
    .eq("encontro_id", encontroId);

  const lista = presencas || [];
  const totalPontuais = lista.filter((p: Record<string, unknown>) => p.status === "pontual").length;
  const totalAtrasados = lista.filter((p: Record<string, unknown>) => p.status === "atrasado").length;
  const totalFaltas = lista.filter((p: Record<string, unknown>) => p.status === "falta").length;
  const totalFaltasJustificadas = lista.filter((p: Record<string, unknown>) => p.status === "falta_justificada").length;
  const totalComMaterial = lista.filter((p: Record<string, unknown>) => p.tem_material === true).length;
  const totalComUniforme = lista.filter((p: Record<string, unknown>) => p.tem_uniforme === true).length;

  return {
    totalMembros: totalMembros || 0,
    totalPresentes: totalPontuais + totalAtrasados,
    totalPontuais,
    totalAtrasados,
    totalFaltas,
    totalFaltasJustificadas,
    totalComMaterial,
    totalComUniforme,
  };
}

export async function getResumoPresencaPorUnidade(encontroId: string): Promise<ResumoPresencaUnidade[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Buscar unidades ativas
  const { data: unidades } = await db
    .from("unidades")
    .select("id, nome, cor_primaria, cor_secundaria")
    .eq("ativa", true)
    .order("nome");

  if (!unidades || unidades.length === 0) {
    return [];
  }

  // Buscar membros ativos com unidade
  const { data: membros } = await db
    .from("membros")
    .select("id, unidade_id")
    .eq("ativo", true)
    .not("unidade_id", "is", null);

  // Buscar presenças do encontro
  const { data: presencas } = await db
    .from("presencas")
    .select("membro_id, status")
    .eq("encontro_id", encontroId);

  // Criar mapas
  const membrosPorUnidade = new Map<string, string[]>();
  (membros || []).forEach((m: Record<string, unknown>) => {
    const uid = m.unidade_id as string;
    if (!membrosPorUnidade.has(uid)) {
      membrosPorUnidade.set(uid, []);
    }
    membrosPorUnidade.get(uid)!.push(m.id as string);
  });

  const presencaMap = new Map<string, string>();
  (presencas || []).forEach((p: Record<string, unknown>) => {
    presencaMap.set(p.membro_id as string, p.status as string);
  });

  return (unidades as Record<string, unknown>[]).map((u) => {
    const membrosIds = membrosPorUnidade.get(u.id as string) || [];
    const totalMembros = membrosIds.length;

    let presentes = 0;
    let faltas = 0;
    let chamadaRealizada = false;

    membrosIds.forEach((membroId) => {
      const status = presencaMap.get(membroId);
      if (status) {
        chamadaRealizada = true;
        if (status === "pontual" || status === "atrasado") {
          presentes++;
        } else {
          faltas++;
        }
      }
    });

    return {
      unidadeId: u.id as string,
      unidadeNome: u.nome as string,
      corPrimaria: u.cor_primaria as string,
      corSecundaria: u.cor_secundaria as string,
      totalMembros,
      totalPresentes: presentes,
      totalFaltas: faltas,
      percentualPresenca: totalMembros > 0 ? Math.round((presentes / totalMembros) * 100) : 0,
      chamadaRealizada,
    };
  });
}

export async function verificarPresencasExistem(encontroId: string): Promise<boolean> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("presencas")
    .select("*", { count: "exact", head: true })
    .eq("encontro_id", encontroId);

  if (error) {
    console.error("Erro ao verificar presenças:", error);
    return false;
  }

  return (count || 0) > 0;
}

export async function verificarChamadaUnidade(
  encontroId: string,
  unidadeId: string
): Promise<boolean> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Buscar membro_ids da unidade
  const { data: membros } = await db
    .from("membros")
    .select("id")
    .eq("unidade_id", unidadeId)
    .eq("ativo", true);

  if (!membros || membros.length === 0) {
    return false;
  }

  const membroIds = (membros as Record<string, unknown>[]).map((m) => m.id as string);

  // Verificar se existe alguma presença para esses membros neste encontro
  const { count } = await db
    .from("presencas")
    .select("*", { count: "exact", head: true })
    .eq("encontro_id", encontroId)
    .in("membro_id", membroIds);

  return (count || 0) > 0;
}

export async function getResumoDiretoria(encontroId: string): Promise<ResumoDiretoria> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Buscar membros da diretoria ativos
  const { data: membros } = await db
    .from("membros")
    .select("id")
    .eq("ativo", true)
    .eq("tipo", "diretoria");

  const membroIds = (membros || []).map((m: Record<string, unknown>) => m.id as string);
  const totalMembros = membroIds.length;

  if (totalMembros === 0) {
    return { totalMembros: 0, totalPresentes: 0, percentualPresenca: 0, chamadaRealizada: false };
  }

  // Buscar presenças desses membros para o encontro
  const { data: presencas } = await db
    .from("presencas")
    .select("membro_id, status")
    .eq("encontro_id", encontroId)
    .in("membro_id", membroIds);

  const lista = presencas || [];
  const chamadaRealizada = lista.length > 0;
  const totalPresentes = lista.filter(
    (p: Record<string, unknown>) => p.status === "pontual" || p.status === "atrasado"
  ).length;

  return {
    totalMembros,
    totalPresentes,
    percentualPresenca: totalMembros > 0 ? Math.round((totalPresentes / totalMembros) * 100) : 0,
    chamadaRealizada,
  };
}
