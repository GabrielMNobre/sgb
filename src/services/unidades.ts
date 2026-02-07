import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type { Unidade, UnidadeFormData, UnidadeComConselheiros } from "@/types/unidade";

export async function getUnidades(): Promise<Unidade[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("unidades")
    .select("*")
    .order("nome");

  if (error) {
    console.error("Erro ao buscar unidades:", error);
    throw new Error("Erro ao buscar unidades");
  }

  return (data || []).map((item) => snakeToCamel<Unidade>(item));
}

export async function getUnidadesAtivas(): Promise<Unidade[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("unidades")
    .select("*")
    .eq("ativa", true)
    .order("nome");

  if (error) {
    console.error("Erro ao buscar unidades ativas:", error);
    throw new Error("Erro ao buscar unidades ativas");
  }

  return (data || []).map((item) => snakeToCamel<Unidade>(item));
}

export async function getUnidadeById(id: string): Promise<Unidade | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("unidades")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar unidade:", error);
    throw new Error("Erro ao buscar unidade");
  }

  return snakeToCamel<Unidade>(data);
}

export async function getUnidadeComConselheiros(id: string): Promise<UnidadeComConselheiros | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
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
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar unidade com conselheiros:", error);
    throw new Error("Erro ao buscar unidade com conselheiros");
  }

  const unidade = snakeToCamel<Unidade>(data);
  const conselheiroUnidade = data.conselheiros_unidades as Array<Record<string, unknown>> || [];
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
}

export async function createUnidade(formData: UnidadeFormData): Promise<Unidade> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToInsert = camelToSnake({
    nome: formData.nome,
    descricao: formData.descricao || null,
    corPrimaria: formData.corPrimaria,
    corSecundaria: formData.corSecundaria,
    ativa: formData.ativa,
  });

  const { data, error } = await db
    .from("unidades")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Já existe uma unidade com este nome");
    }
    console.error("Erro ao criar unidade:", error);
    throw new Error("Erro ao criar unidade");
  }

  return snakeToCamel<Unidade>(data);
}

export async function updateUnidade(id: string, formData: UnidadeFormData): Promise<Unidade> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToUpdate = camelToSnake({
    nome: formData.nome,
    descricao: formData.descricao || null,
    corPrimaria: formData.corPrimaria,
    corSecundaria: formData.corSecundaria,
    ativa: formData.ativa,
    atualizadoEm: new Date().toISOString(),
  });

  const { data, error } = await db
    .from("unidades")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Já existe uma unidade com este nome");
    }
    console.error("Erro ao atualizar unidade:", error);
    throw new Error("Erro ao atualizar unidade");
  }

  return snakeToCamel<Unidade>(data);
}

export async function toggleUnidadeStatus(id: string, ativa: boolean): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("unidades")
    .update({ ativa, atualizado_em: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Erro ao alterar status da unidade:", error);
    throw new Error("Erro ao alterar status da unidade");
  }
}

export async function countUnidadesAtivas(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("unidades")
    .select("*", { count: "exact", head: true })
    .eq("ativa", true);

  if (error) {
    console.error("Erro ao contar unidades:", error);
    return 0;
  }

  return count || 0;
}

export interface UnidadeComContagem extends Unidade {
  totalMembros: number;
}

export async function getUnidadesComContagem(): Promise<UnidadeComContagem[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("unidades")
    .select(`
      *,
      membros (
        id
      )
    `)
    .eq("ativa", true)
    .order("nome");

  if (error) {
    console.error("Erro ao buscar unidades com contagem:", error);
    throw new Error("Erro ao buscar unidades com contagem");
  }

  return (data || []).map((item: Record<string, unknown>) => {
    const unidade = snakeToCamel<Unidade>(item);
    const membros = item.membros as Array<unknown> || [];
    return {
      ...unidade,
      totalMembros: membros.length,
    };
  });
}
