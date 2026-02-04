import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type { Especialidade, EspecialidadeFormData, CategoriaEspecialidade } from "@/types/especialidade";

export async function getEspecialidades(): Promise<Especialidade[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("especialidades")
    .select("*")
    .order("categoria")
    .order("nome");

  if (error) {
    console.error("Erro ao buscar especialidades:", error);
    throw new Error("Erro ao buscar especialidades");
  }

  return (data || []).map((item: Record<string, unknown>) => snakeToCamel<Especialidade>(item));
}

export async function getEspecialidadesAtivas(): Promise<Especialidade[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("especialidades")
    .select("*")
    .eq("ativa", true)
    .order("categoria")
    .order("nome");

  if (error) {
    console.error("Erro ao buscar especialidades ativas:", error);
    throw new Error("Erro ao buscar especialidades ativas");
  }

  return (data || []).map((item: Record<string, unknown>) => snakeToCamel<Especialidade>(item));
}

export async function getEspecialidadesPorCategoria(
  categoria: CategoriaEspecialidade
): Promise<Especialidade[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("especialidades")
    .select("*")
    .eq("categoria", categoria)
    .order("nome");

  if (error) {
    console.error("Erro ao buscar especialidades por categoria:", error);
    throw new Error("Erro ao buscar especialidades por categoria");
  }

  return (data || []).map((item: Record<string, unknown>) => snakeToCamel<Especialidade>(item));
}

export async function getEspecialidadeById(id: string): Promise<Especialidade | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("especialidades")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar especialidade:", error);
    throw new Error("Erro ao buscar especialidade");
  }

  return snakeToCamel<Especialidade>(data);
}

export async function createEspecialidade(formData: EspecialidadeFormData): Promise<Especialidade> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToInsert = camelToSnake({
    nome: formData.nome,
    categoria: formData.categoria,
    descricao: formData.descricao || null,
    ativa: formData.ativa,
  });

  const { data, error } = await db
    .from("especialidades")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Já existe uma especialidade com este nome");
    }
    console.error("Erro ao criar especialidade:", error);
    throw new Error("Erro ao criar especialidade");
  }

  return snakeToCamel<Especialidade>(data);
}

export async function updateEspecialidade(
  id: string,
  formData: EspecialidadeFormData
): Promise<Especialidade> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToUpdate = camelToSnake({
    nome: formData.nome,
    categoria: formData.categoria,
    descricao: formData.descricao || null,
    ativa: formData.ativa,
  });

  const { data, error } = await db
    .from("especialidades")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Já existe uma especialidade com este nome");
    }
    console.error("Erro ao atualizar especialidade:", error);
    throw new Error("Erro ao atualizar especialidade");
  }

  return snakeToCamel<Especialidade>(data);
}

export async function toggleEspecialidadeStatus(id: string, ativa: boolean): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("especialidades")
    .update({ ativa })
    .eq("id", id);

  if (error) {
    console.error("Erro ao alterar status da especialidade:", error);
    throw new Error("Erro ao alterar status da especialidade");
  }
}

export async function countEspecialidadesAtivas(): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { count, error } = await db
    .from("especialidades")
    .select("*", { count: "exact", head: true })
    .eq("ativa", true);

  if (error) {
    console.error("Erro ao contar especialidades:", error);
    return 0;
  }

  return count || 0;
}

export async function searchEspecialidades(
  query: string,
  categoria?: CategoriaEspecialidade
): Promise<Especialidade[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let queryBuilder = db
    .from("especialidades")
    .select("*")
    .ilike("nome", `%${query}%`)
    .eq("ativa", true);

  if (categoria) {
    queryBuilder = queryBuilder.eq("categoria", categoria);
  }

  const { data, error } = await queryBuilder.order("nome");

  if (error) {
    console.error("Erro ao buscar especialidades:", error);
    throw new Error("Erro ao buscar especialidades");
  }

  return (data || []).map((item: Record<string, unknown>) => snakeToCamel<Especialidade>(item));
}
