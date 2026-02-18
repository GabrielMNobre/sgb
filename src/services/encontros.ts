import { createClient } from "@/lib/supabase/server";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type {
  Encontro,
  EncontroFormData,
  FiltrosEncontro,
} from "@/types/encontro";

export async function getEncontros(filtros?: FiltrosEncontro): Promise<Encontro[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("encontros")
    .select("*")
    .order("data", { ascending: false });

  if (filtros?.status) {
    query = query.eq("status", filtros.status);
  }

  if (filtros?.dataInicio) {
    query = query.gte("data", filtros.dataInicio);
  }

  if (filtros?.dataFim) {
    query = query.lte("data", filtros.dataFim);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar encontros:", error);
    throw new Error("Erro ao buscar encontros");
  }

  return (data || []).map((item: Record<string, unknown>) => snakeToCamel<Encontro>(item));
}

export async function getEncontroById(id: string): Promise<Encontro | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("encontros")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar encontro:", error);
    throw new Error("Erro ao buscar encontro");
  }

  return snakeToCamel<Encontro>(data);
}

export async function createEncontro(
  formData: EncontroFormData,
  usuarioId: string
): Promise<Encontro> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Verificar data duplicada
  const duplicada = await verificarDataDuplicada(formData.data);
  if (duplicada) {
    throw new Error("Já existe um encontro agendado para esta data");
  }

  const dataToInsert = {
    data: formData.data,
    descricao: formData.descricao || null,
    status: "agendado",
    criado_por: usuarioId,
  };

  const { data, error } = await db
    .from("encontros")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar encontro:", error);
    throw new Error("Erro ao criar encontro");
  }

  return snakeToCamel<Encontro>(data);
}

export async function updateEncontro(
  id: string,
  formData: Partial<EncontroFormData>
): Promise<Encontro> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Verificar se encontro existe e não é finalizado
  const encontro = await getEncontroById(id);
  if (!encontro) {
    throw new Error("Encontro não encontrado");
  }
  if (encontro.status === "finalizado") {
    throw new Error("Não é possível editar um encontro finalizado");
  }

  // Verificar data duplicada (excluindo o próprio)
  if (formData.data) {
    const duplicada = await verificarDataDuplicada(formData.data, id);
    if (duplicada) {
      throw new Error("Já existe um encontro agendado para esta data");
    }
  }

  const dataToUpdate: Record<string, unknown> = {
    data: formData.data,
    descricao: formData.descricao !== undefined ? formData.descricao || null : undefined,
    atualizado_em: new Date().toISOString(),
  };

  // Remove undefined values
  Object.keys(dataToUpdate).forEach((key) => {
    if (dataToUpdate[key] === undefined) {
      delete dataToUpdate[key];
    }
  });

  const { data, error } = await db
    .from("encontros")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar encontro:", error);
    throw new Error("Erro ao atualizar encontro");
  }

  return snakeToCamel<Encontro>(data);
}

export async function deleteEncontro(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Verificar se tem presenças
  const { count } = await db
    .from("presencas")
    .select("*", { count: "exact", head: true })
    .eq("encontro_id", id);

  if (count && count > 0) {
    throw new Error("Não é possível excluir um encontro que já tem presenças registradas");
  }

  const { error } = await db
    .from("encontros")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir encontro:", error);
    throw new Error("Erro ao excluir encontro");
  }
}

export async function iniciarEncontro(id: string): Promise<Encontro> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("encontros")
    .update({
      status: "em_andamento",
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "agendado")
    .select()
    .single();

  if (error) {
    console.error("Erro ao iniciar encontro:", error);
    throw new Error("Erro ao iniciar encontro");
  }

  return snakeToCamel<Encontro>(data);
}

export async function finalizarEncontro(id: string): Promise<Encontro> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("encontros")
    .update({
      status: "finalizado",
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "em_andamento")
    .select()
    .single();

  if (error) {
    console.error("Erro ao finalizar encontro:", error);
    throw new Error("Erro ao finalizar encontro");
  }

  return snakeToCamel<Encontro>(data);
}

export async function getProximoEncontro(): Promise<Encontro | null> {
  const encontros = await getProximosEncontros(1);
  return encontros.length > 0 ? encontros[0] : null;
}

export async function getProximosEncontros(limite: number = 4): Promise<Encontro[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const hoje = new Date().toISOString().split("T")[0];

  const { data, error } = await db
    .from("encontros")
    .select("*")
    .neq("status", "finalizado")
    .gte("data", hoje)
    .order("data", { ascending: true })
    .limit(limite);

  if (error) {
    console.error("Erro ao buscar próximos encontros:", error);
    return [];
  }

  return (data || []).map((item: Record<string, unknown>) => snakeToCamel<Encontro>(item));
}

export async function getEncontroEmAndamento(): Promise<Encontro | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("encontros")
    .select("*")
    .eq("status", "em_andamento")
    .order("data", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar encontro em andamento:", error);
    return null;
  }

  return snakeToCamel<Encontro>(data);
}

export async function countEncontrosNoMes(): Promise<number> {
  const supabase = await createClient();

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { count, error } = await supabase
    .from("encontros")
    .select("*", { count: "exact", head: true })
    .gte("data", firstDay)
    .lte("data", lastDay);

  if (error) {
    console.error("Erro ao contar encontros do mês:", error);
    return 0;
  }

  return count || 0;
}

async function verificarDataDuplicada(data: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("encontros")
    .select("id", { count: "exact", head: true })
    .eq("data", data);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count } = await query;

  return (count || 0) > 0;
}
