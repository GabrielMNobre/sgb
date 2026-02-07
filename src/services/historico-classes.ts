import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type { HistoricoClasseComRelacoes, HistoricoClasseFormData, HistoricoClasse } from "@/types/membro";

export async function getHistoricoDoMembro(
  membroId: string
): Promise<HistoricoClasseComRelacoes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("historico_classes")
    .select(`
      *,
      classes (
        id,
        nome,
        tipo,
        ordem
      )
    `)
    .eq("membro_id", membroId)
    .order("ano", { ascending: false });

  if (error) {
    console.error("Erro ao buscar historico de classes do membro:", error);
    throw new Error("Erro ao buscar historico de classes do membro");
  }

  return (data || []).map((item: Record<string, unknown>) => {
    const base = snakeToCamel<HistoricoClasse>(item);
    const classeData = item.classes as Record<string, unknown> | null;
    return {
      ...base,
      classe: classeData ? {
        id: classeData.id as string,
        nome: classeData.nome as string,
        tipo: classeData.tipo as string,
        ordem: classeData.ordem as number,
      } : { id: "", nome: "", tipo: "", ordem: 0 },
    };
  });
}

export async function adicionarHistoricoClasse(
  membroId: string,
  data: HistoricoClasseFormData
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Verificar se ja existe registro para este membro, classe e ano
  const { data: existente } = await db
    .from("historico_classes")
    .select("id")
    .eq("membro_id", membroId)
    .eq("classe_id", data.classeId)
    .eq("ano", data.ano)
    .single();

  if (existente) {
    throw new Error("Este membro ja possui registro desta classe neste ano");
  }

  const dataToInsert = camelToSnake({
    membroId,
    classeId: data.classeId,
    ano: data.ano,
    dataInvestidura: data.dataInvestidura || null,
    observacao: data.observacao || null,
  });

  const { error } = await db
    .from("historico_classes")
    .insert(dataToInsert);

  if (error) {
    console.error("Erro ao adicionar historico de classe:", error);
    throw new Error("Erro ao adicionar historico de classe");
  }
}

export async function removerHistoricoClasse(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("historico_classes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover historico de classe:", error);
    throw new Error("Erro ao remover historico de classe");
  }
}

/**
 * Atualiza a classe_id do membro para a classe de maior ordem no histórico
 * Chamada automaticamente após adicionar ou remover classe do histórico
 */
export async function atualizarClasseAtualDoMembro(membroId: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Buscar todas as classes do histórico do membro
  const { data: historico, error: historicoError } = await db
    .from("historico_classes")
    .select(`
      id,
      classe_id,
      classes (
        id,
        ordem
      )
    `)
    .eq("membro_id", membroId);

  if (historicoError) {
    console.error("Erro ao buscar histórico de classes:", historicoError);
    throw new Error("Erro ao atualizar classe atual do membro");
  }

  // Se não há histórico, limpar a classe_id
  if (!historico || historico.length === 0) {
    await db
      .from("membros")
      .update({
        classe_id: null,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", membroId);
    return;
  }

  // Encontrar a classe de maior ordem
  let maiorOrdem = -1;
  let classeIdMaiorOrdem = null;

  for (const item of historico) {
    const classe = item.classes as { id: string; ordem: number } | null;
    if (classe && classe.ordem > maiorOrdem) {
      maiorOrdem = classe.ordem;
      classeIdMaiorOrdem = classe.id;
    }
  }

  // Atualizar o membro com a classe de maior ordem
  if (classeIdMaiorOrdem) {
    const { error: updateError } = await db
      .from("membros")
      .update({
        classe_id: classeIdMaiorOrdem,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", membroId);

    if (updateError) {
      console.error("Erro ao atualizar classe do membro:", updateError);
      throw new Error("Erro ao atualizar classe atual do membro");
    }
  }
}
