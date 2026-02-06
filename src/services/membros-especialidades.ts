import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type {
  MembroEspecialidade,
  MembroEspecialidadeComRelacoes,
  MembroEspecialidadeFormData,
  EspecialidadePendente,
  CategoriaEspecialidade,
} from "@/types/especialidade";

export async function getEspecialidadesDoMembro(
  membroId: string
): Promise<MembroEspecialidadeComRelacoes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("membros_especialidades")
    .select(`
      *,
      especialidades (
        id,
        nome,
        categoria
      )
    `)
    .eq("membro_id", membroId)
    .order("data_conclusao", { ascending: false });

  if (error) {
    console.error("Erro ao buscar especialidades do membro:", error);
    throw new Error("Erro ao buscar especialidades do membro");
  }

  return (data || []).map((item: Record<string, unknown>) => {
    const base = snakeToCamel<MembroEspecialidade>(item);
    const esp = item.especialidades as Record<string, unknown> | null;
    return {
      ...base,
      especialidade: esp ? {
        id: esp.id as string,
        nome: esp.nome as string,
        categoria: esp.categoria as CategoriaEspecialidade,
      } : { id: "", nome: "", categoria: "adra" as CategoriaEspecialidade },
    };
  });
}

export async function countEspecialidadesDoMembro(membroId: string): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { count, error } = await db
    .from("membros_especialidades")
    .select("*", { count: "exact", head: true })
    .eq("membro_id", membroId);

  if (error) {
    console.error("Erro ao contar especialidades do membro:", error);
    return 0;
  }

  return count || 0;
}

export async function registrarConquista(
  formData: MembroEspecialidadeFormData,
  registradoPor?: string
): Promise<MembroEspecialidade> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Verificar se já existe esta especialidade para este membro
  const { data: existente } = await db
    .from("membros_especialidades")
    .select("id")
    .eq("membro_id", formData.membroId)
    .eq("especialidade_id", formData.especialidadeId)
    .single();

  if (existente) {
    throw new Error("Este membro já possui esta especialidade");
  }

  const dataToInsert = camelToSnake({
    membroId: formData.membroId,
    especialidadeId: formData.especialidadeId,
    dataConclusao: formData.dataConclusao,
    entregue: formData.entregue,
    dataEntrega: formData.entregue ? formData.dataEntrega : null,
    observacao: formData.observacao || null,
    registradoPor: registradoPor || null,
  });

  const { data, error } = await db
    .from("membros_especialidades")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("Erro ao registrar conquista:", error);
    throw new Error("Erro ao registrar especialidade");
  }

  return snakeToCamel<MembroEspecialidade>(data);
}

export async function marcarEntrega(
  id: string,
  dataEntrega: string
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("membros_especialidades")
    .update({
      entregue: true,
      data_entrega: dataEntrega,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao marcar entrega:", error);
    throw new Error("Erro ao registrar entrega");
  }
}

export async function marcarEntregasEmLote(
  ids: string[],
  dataEntrega: string
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("membros_especialidades")
    .update({
      entregue: true,
      data_entrega: dataEntrega,
      atualizado_em: new Date().toISOString(),
    })
    .in("id", ids);

  if (error) {
    console.error("Erro ao marcar entregas em lote:", error);
    throw new Error("Erro ao registrar entregas");
  }
}

export async function getEspecialidadesPendentes(
  unidadeId?: string,
  membroId?: string
): Promise<EspecialidadePendente[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("membros_especialidades")
    .select(`
      id,
      membro_id,
      especialidade_id,
      data_conclusao,
      membros (
        id,
        nome,
        unidade_id,
        unidades (
          id,
          nome
        )
      ),
      especialidades (
        id,
        nome
      )
    `)
    .eq("entregue", false)
    .order("data_conclusao", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar especialidades pendentes:", error);
    throw new Error("Erro ao buscar especialidades pendentes");
  }

  let result: EspecialidadePendente[] = (data || []).map((item: Record<string, unknown>) => {
    const membro = item.membros as Record<string, unknown> | null;
    const unidade = membro?.unidades as Record<string, unknown> | null;
    const especialidade = item.especialidades as Record<string, unknown> | null;

    return {
      id: item.id as string,
      membroId: item.membro_id as string,
      membroNome: membro?.nome as string || "",
      unidadeId: membro?.unidade_id as string | undefined,
      unidadeNome: unidade?.nome as string | undefined,
      especialidadeId: item.especialidade_id as string,
      especialidadeNome: especialidade?.nome as string || "",
      dataConclusao: new Date(item.data_conclusao as string),
    };
  });

  // Filtrar por unidade se especificado
  if (unidadeId) {
    result = result.filter((item: EspecialidadePendente) => item.unidadeId === unidadeId);
  }

  // Filtrar por membro se especificado
  if (membroId) {
    result = result.filter((item: EspecialidadePendente) => item.membroId === membroId);
  }

  return result;
}

export async function removerConquista(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("membros_especialidades")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover conquista:", error);
    throw new Error("Erro ao remover especialidade");
  }
}

export async function getMembrosComEspecialidadesDaUnidade(
  unidadeId: string
): Promise<Array<{
  id: string;
  nome: string;
  classeNome?: string;
  totalEspecialidades: number;
}>> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Buscar membros da unidade
  const { data: membros, error: membrosError } = await db
    .from("membros")
    .select(`
      id,
      nome,
      classes (
        id,
        nome
      )
    `)
    .eq("unidade_id", unidadeId)
    .eq("ativo", true)
    .order("nome");

  if (membrosError) {
    console.error("Erro ao buscar membros:", membrosError);
    throw new Error("Erro ao buscar membros da unidade");
  }

  // Para cada membro, contar especialidades
  const result = await Promise.all(
    (membros || []).map(async (membro: Record<string, unknown>) => {
      const classe = membro.classes as Record<string, unknown> | null;
      const count = await countEspecialidadesDoMembro(membro.id as string);
      return {
        id: membro.id as string,
        nome: membro.nome as string,
        classeNome: classe?.nome as string | undefined,
        totalEspecialidades: count,
      };
    })
  );

  return result;
}

export async function getAllConquistas(): Promise<MembroEspecialidadeComRelacoes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("membros_especialidades")
    .select(`
      *,
      especialidades (
        id,
        nome,
        categoria
      ),
      membros (
        id,
        nome,
        unidade_id,
        unidades (
          id,
          nome
        )
      )
    `)
    .order("data_conclusao", { ascending: false });

  if (error) {
    console.error("Erro ao buscar conquistas:", error);
    throw new Error("Erro ao buscar conquistas");
  }

  return (data || []).map((item: Record<string, unknown>) => {
    const base = snakeToCamel<MembroEspecialidade>(item);
    const esp = item.especialidades as Record<string, unknown> | null;
    const membro = item.membros as Record<string, unknown> | null;
    const unidade = membro?.unidades as Record<string, unknown> | null;
    return {
      ...base,
      especialidade: esp ? {
        id: esp.id as string,
        nome: esp.nome as string,
        categoria: esp.categoria as string,
      } : { id: "", nome: "", categoria: "" },
      membro: membro ? {
        id: membro.id as string,
        nome: membro.nome as string,
        unidadeId: membro.unidade_id as string | undefined,
        unidadeNome: unidade?.nome as string | undefined,
      } : undefined,
    };
  });
}

export async function countTotalConquistas(): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { count, error } = await db
    .from("membros_especialidades")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Erro ao contar conquistas:", error);
    return 0;
  }

  return count || 0;
}

export async function countConquistasPendentes(): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { count, error } = await db
    .from("membros_especialidades")
    .select("*", { count: "exact", head: true })
    .eq("entregue", false);

  if (error) {
    console.error("Erro ao contar conquistas pendentes:", error);
    return 0;
  }

  return count || 0;
}
