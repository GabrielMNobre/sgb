import { createClient } from "@/lib/supabase/server";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type { ConselheiroVinculo, UnidadeComConselheiros } from "@/types/unidade";

export interface ConselheiroDisponivel {
  id: string;
  nome: string;
}

export async function getConselheirosDisponiveis(): Promise<ConselheiroDisponivel[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("membros")
    .select("id, nome")
    .eq("tipo", "diretoria")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("Erro ao buscar membros da diretoria:", error);
    throw new Error("Erro ao buscar membros da diretoria");
  }

  return data || [];
}

export async function getUnidadesComConselheiros(): Promise<UnidadeComConselheiros[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("unidades")
    .select(`
      *,
      conselheiros_unidades (
        id,
        unidade_id,
        membro_id,
        principal,
        membros (
          id,
          nome
        )
      )
    `)
    .eq("ativa", true)
    .order("nome");

  if (error) {
    console.error("Erro ao buscar unidades com conselheiros:", error);
    throw new Error("Erro ao buscar unidades com conselheiros");
  }

  return (data || []).map((item: Record<string, unknown>) => {
    const unidade = snakeToCamel<UnidadeComConselheiros>(item);
    const conselheiroUnidade = item.conselheiros_unidades as Array<Record<string, unknown>> || [];
    const conselheiros = conselheiroUnidade.map((c) => ({
      id: c.id as string,
      unidadeId: c.unidade_id as string,
      membroId: c.membro_id as string,
      principal: c.principal as boolean,
      membro: c.membros ? {
        id: (c.membros as Record<string, unknown>).id as string,
        nome: (c.membros as Record<string, unknown>).nome as string,
      } : { id: "", nome: "" },
    }));

    return { ...unidade, conselheiros };
  });
}

export async function vincularConselheiro(
  unidadeId: string,
  membroId: string,
  principal: boolean = false
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Se for principal, desmarcar o principal atual
  if (principal) {
    await db
      .from("conselheiros_unidades")
      .update({ principal: false })
      .eq("unidade_id", unidadeId)
      .eq("principal", true);
  }

  // Verificar se já existe vínculo
  const { data: existente } = await db
    .from("conselheiros_unidades")
    .select("id")
    .eq("unidade_id", unidadeId)
    .eq("membro_id", membroId)
    .single();

  if (existente) {
    // Atualizar vínculo existente
    const { error } = await db
      .from("conselheiros_unidades")
      .update({ principal })
      .eq("id", existente.id);

    if (error) {
      console.error("Erro ao atualizar vínculo:", error);
      throw new Error("Erro ao atualizar vínculo do conselheiro");
    }
  } else {
    // Criar novo vínculo
    const { error } = await db
      .from("conselheiros_unidades")
      .insert({
        unidade_id: unidadeId,
        membro_id: membroId,
        principal,
      });

    if (error) {
      console.error("Erro ao vincular conselheiro:", error);
      throw new Error("Erro ao vincular conselheiro");
    }
  }
}

export async function removerVinculoConselheiro(
  unidadeId: string,
  membroId: string
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("conselheiros_unidades")
    .delete()
    .eq("unidade_id", unidadeId)
    .eq("membro_id", membroId);

  if (error) {
    console.error("Erro ao remover vínculo:", error);
    throw new Error("Erro ao remover vínculo do conselheiro");
  }
}

export async function definirConselheiroPrincipal(
  unidadeId: string,
  membroId: string
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Desmarcar o principal atual
  await db
    .from("conselheiros_unidades")
    .update({ principal: false })
    .eq("unidade_id", unidadeId)
    .eq("principal", true);

  // Marcar o novo principal
  const { error } = await db
    .from("conselheiros_unidades")
    .update({ principal: true })
    .eq("unidade_id", unidadeId)
    .eq("membro_id", membroId);

  if (error) {
    console.error("Erro ao definir conselheiro principal:", error);
    throw new Error("Erro ao definir conselheiro principal");
  }
}

export async function getConselheirosVinculados(unidadeId: string): Promise<ConselheiroVinculo[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("conselheiros_unidades")
    .select(`
      id,
      unidade_id,
      membro_id,
      principal,
      membros (
        id,
        nome
      )
    `)
    .eq("unidade_id", unidadeId);

  if (error) {
    console.error("Erro ao buscar conselheiros vinculados:", error);
    throw new Error("Erro ao buscar conselheiros vinculados");
  }

  return (data || []).map((c: Record<string, unknown>) => ({
    id: c.id as string,
    unidadeId: c.unidade_id as string,
    membroId: c.membro_id as string,
    principal: c.principal as boolean,
    membro: c.membros ? {
      id: (c.membros as Record<string, unknown>).id as string,
      nome: (c.membros as Record<string, unknown>).nome as string,
    } : { id: "", nome: "" },
  }));
}

export async function getUnidadeDoConselheiro(membroId: string): Promise<{
  unidadeId: string;
  unidadeNome: string;
  principal: boolean;
} | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("conselheiros_unidades")
    .select(`
      unidade_id,
      principal,
      unidades (
        id,
        nome
      )
    `)
    .eq("membro_id", membroId)
    .order("principal", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar unidade do conselheiro:", error);
    return null;
  }

  const unidade = data.unidades as Record<string, unknown> | null;

  return {
    unidadeId: data.unidade_id as string,
    unidadeNome: unidade?.nome as string || "",
    principal: data.principal as boolean,
  };
}

export async function countConselheirosAtivos(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("conselheiros_unidades")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Erro ao contar membros da diretoria:", error);
    return 0;
  }

  return count || 0;
}
