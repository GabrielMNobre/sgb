import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type { Usuario } from "@/types/auth";

export interface UsuarioComMembro extends Usuario {
  membroNome?: string;
}

export interface UsuarioFormData {
  nome: string;
  papel: "admin" | "secretaria" | "tesoureiro" | "conselheiro";
  membroId?: string | null;
  ativo: boolean;
}

export async function getUsuarios(): Promise<UsuarioComMembro[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("usuarios")
    .select(`
      *,
      membros (
        id,
        nome
      )
    `)
    .order("nome");

  if (error) {
    console.error("Erro ao buscar usuários:", error);
    throw new Error("Erro ao buscar usuários");
  }

  return (data || []).map((item: Record<string, unknown>) => {
    const usuario = snakeToCamel<Usuario>(item);
    const membro = item.membros as Record<string, unknown> | null;

    return {
      ...usuario,
      membroNome: membro ? (membro.nome as string) : undefined,
    };
  });
}

export async function getUsuario(id: string): Promise<UsuarioComMembro | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("usuarios")
    .select(`
      *,
      membros (
        id,
        nome
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar usuário:", error);
    throw new Error("Erro ao buscar usuário");
  }

  const usuario = snakeToCamel<Usuario>(data);
  const membro = data.membros as Record<string, unknown> | null;

  return {
    ...usuario,
    membroNome: membro ? (membro.nome as string) : undefined,
  };
}

export async function updateUsuario(id: string, data: UsuarioFormData): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const updateData = camelToSnake({
    nome: data.nome,
    papel: data.papel,
    membroId: data.membroId || null,
    ativo: data.ativo,
    atualizadoEm: new Date().toISOString(),
  });

  const { error } = await db
    .from("usuarios")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw new Error("Erro ao atualizar usuário");
  }
}

export async function countUsuariosAtivos(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("usuarios")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true);

  if (error) {
    console.error("Erro ao contar usuários:", error);
    return 0;
  }

  return count || 0;
}

export async function verificarMembroJaVinculado(membroId: string, usuarioId?: string): Promise<boolean> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("usuarios")
    .select("id", { count: "exact", head: true })
    .eq("membro_id", membroId);

  // Se estamos editando um usuário, excluir ele da verificação
  if (usuarioId) {
    query = query.neq("id", usuarioId);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Erro ao verificar membro vinculado:", error);
    return false;
  }

  return (count || 0) > 0;
}
