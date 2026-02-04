import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type { Membro, MembroComRelacoes, MembroFormData, Classe } from "@/types/membro";

export interface FiltrosMembro {
  tipo?: string;
  unidadeId?: string;
  classeId?: string;
  ativo?: boolean;
  busca?: string;
}

export async function getMembros(filtros?: FiltrosMembro): Promise<MembroComRelacoes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("membros")
    .select(`
      *,
      unidades (
        id,
        nome,
        cor_primaria
      ),
      classes (
        id,
        nome
      )
    `)
    .order("nome");

  if (filtros?.tipo) {
    query = query.eq("tipo", filtros.tipo);
  }

  if (filtros?.unidadeId) {
    query = query.eq("unidade_id", filtros.unidadeId);
  }

  if (filtros?.classeId) {
    query = query.eq("classe_id", filtros.classeId);
  }

  if (filtros?.ativo !== undefined) {
    query = query.eq("ativo", filtros.ativo);
  }

  if (filtros?.busca) {
    query = query.ilike("nome", `%${filtros.busca}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar membros:", error);
    throw new Error("Erro ao buscar membros");
  }

  return (data || []).map((item: Record<string, unknown>) => {
    const membro = snakeToCamel<Membro>(item);
    const unidades = item.unidades as Record<string, unknown> | null;
    const classes = item.classes as Record<string, unknown> | null;
    return {
      ...membro,
      unidade: unidades ? {
        id: unidades.id as string,
        nome: unidades.nome as string,
        corPrimaria: unidades.cor_primaria as string,
      } : undefined,
      classe: classes ? {
        id: classes.id as string,
        nome: classes.nome as string,
      } : undefined,
    };
  });
}

export async function getMembrosAtivos(): Promise<Membro[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("membros")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("Erro ao buscar membros ativos:", error);
    throw new Error("Erro ao buscar membros ativos");
  }

  return (data || []).map((item) => snakeToCamel<Membro>(item));
}

export async function getMembroById(id: string): Promise<MembroComRelacoes | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("membros")
    .select(`
      *,
      unidades (
        id,
        nome,
        cor_primaria
      ),
      classes (
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
    console.error("Erro ao buscar membro:", error);
    throw new Error("Erro ao buscar membro");
  }

  const membro = snakeToCamel<Membro>(data);
  const unidades = data.unidades as Record<string, unknown> | null;
  const classes = data.classes as Record<string, unknown> | null;
  return {
    ...membro,
    unidade: unidades ? {
      id: unidades.id as string,
      nome: unidades.nome as string,
      corPrimaria: unidades.cor_primaria as string,
    } : undefined,
    classe: classes ? {
      id: classes.id as string,
      nome: classes.nome as string,
    } : undefined,
  };
}

export async function createMembro(formData: MembroFormData): Promise<Membro> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToInsert = camelToSnake({
    nome: formData.nome,
    dataNascimento: formData.dataNascimento || null,
    tipo: formData.tipo,
    unidadeId: formData.unidadeId || null,
    classeId: formData.classeId || null,
    telefone: formData.telefone || null,
    responsavel: formData.responsavel || null,
    telefoneResponsavel: formData.telefoneResponsavel || null,
    ativo: formData.ativo,
  });

  const { data, error } = await db
    .from("membros")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar membro:", error);
    throw new Error("Erro ao cadastrar membro");
  }

  // Se tem classe, registrar no histórico
  if (formData.classeId) {
    await registrarHistoricoClasse(data.id, formData.classeId);
  }

  return snakeToCamel<Membro>(data);
}

export async function updateMembro(id: string, formData: MembroFormData): Promise<Membro> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Buscar membro atual para comparar classe
  const membroAtual = await getMembroById(id);

  const dataToUpdate = camelToSnake({
    nome: formData.nome,
    dataNascimento: formData.dataNascimento || null,
    tipo: formData.tipo,
    unidadeId: formData.unidadeId || null,
    classeId: formData.classeId || null,
    telefone: formData.telefone || null,
    responsavel: formData.responsavel || null,
    telefoneResponsavel: formData.telefoneResponsavel || null,
    ativo: formData.ativo,
    atualizadoEm: new Date().toISOString(),
  });

  const { data, error } = await db
    .from("membros")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar membro:", error);
    throw new Error("Erro ao atualizar membro");
  }

  // Se mudou a classe, registrar no histórico
  if (formData.classeId && formData.classeId !== membroAtual?.classeId) {
    await registrarHistoricoClasse(id, formData.classeId);
  }

  return snakeToCamel<Membro>(data);
}

export async function toggleMembroStatus(id: string, ativo: boolean): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("membros")
    .update({ ativo, atualizado_em: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Erro ao alterar status do membro:", error);
    throw new Error("Erro ao alterar status do membro");
  }
}

async function registrarHistoricoClasse(membroId: string, classeId: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const anoAtual = new Date().getFullYear();

  // Verificar se já existe registro para este ano e classe
  const { data: existente } = await db
    .from("historico_classes")
    .select("id")
    .eq("membro_id", membroId)
    .eq("classe_id", classeId)
    .eq("ano", anoAtual)
    .single();

  if (!existente) {
    await db
      .from("historico_classes")
      .insert({
        membro_id: membroId,
        classe_id: classeId,
        ano: anoAtual,
      });
  }
}

// Classes
export async function getClasses(tipo?: "desbravador" | "lideranca"): Promise<Classe[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("classes")
    .select("*")
    .order("ordem");

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar classes:", error);
    throw new Error("Erro ao buscar classes");
  }

  return (data || []).map((item: Record<string, unknown>) => snakeToCamel<Classe>(item));
}

// Contadores para dashboard
export async function countMembrosAtivos(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("membros")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true);

  if (error) {
    console.error("Erro ao contar membros:", error);
    return 0;
  }

  return count || 0;
}

export async function countDesbravadoresAtivos(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("membros")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true)
    .eq("tipo", "desbravador");

  if (error) {
    console.error("Erro ao contar desbravadores:", error);
    return 0;
  }

  return count || 0;
}

export async function countDiretoriaAtivos(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("membros")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true)
    .eq("tipo", "diretoria");

  if (error) {
    console.error("Erro ao contar diretoria:", error);
    return 0;
  }

  return count || 0;
}

export async function getMembrosRecentes(limite: number = 5): Promise<MembroComRelacoes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("membros")
    .select(`
      *,
      unidades (
        id,
        nome,
        cor_primaria
      ),
      classes (
        id,
        nome
      )
    `)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) {
    console.error("Erro ao buscar membros recentes:", error);
    throw new Error("Erro ao buscar membros recentes");
  }

  return (data || []).map((item: Record<string, unknown>) => {
    const membro = snakeToCamel<Membro>(item);
    const unidades = item.unidades as Record<string, unknown> | null;
    const classes = item.classes as Record<string, unknown> | null;
    return {
      ...membro,
      unidade: unidades ? {
        id: unidades.id as string,
        nome: unidades.nome as string,
        corPrimaria: unidades.cor_primaria as string,
      } : undefined,
      classe: classes ? {
        id: classes.id as string,
        nome: classes.nome as string,
      } : undefined,
    };
  });
}
