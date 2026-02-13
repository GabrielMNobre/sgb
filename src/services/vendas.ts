import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type {
  CategoriaVenda,
  CategoriaVendaFormData,
  Venda,
  VendaComCategoria,
  VendaFormData,
  FiltrosVenda,
} from "@/types/venda";

// ========== CRUD Categorias ==========

export async function getCategorias(): Promise<CategoriaVenda[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("categorias_vendas")
    .select("*")
    .order("nome");

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    throw new Error("Erro ao buscar categorias");
  }

  return (data || []).map((item: any) => snakeToCamel<CategoriaVenda>(item));
}

export async function getCategoriaById(
  id: string
): Promise<CategoriaVenda | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("categorias_vendas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar categoria:", error);
    throw new Error("Erro ao buscar categoria");
  }

  return snakeToCamel<CategoriaVenda>(data);
}

export async function createCategoria(
  formData: CategoriaVendaFormData
): Promise<CategoriaVenda> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToInsert = camelToSnake({
    nome: formData.nome,
    descricao: formData.descricao || null,
    ativo: true,
  });

  const { data, error } = await db
    .from("categorias_vendas")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar categoria:", error);
    throw new Error("Erro ao criar categoria");
  }

  return snakeToCamel<CategoriaVenda>(data);
}

export async function updateCategoria(
  id: string,
  formData: CategoriaVendaFormData
): Promise<CategoriaVenda> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToUpdate = camelToSnake({
    nome: formData.nome,
    descricao: formData.descricao || null,
    atualizadoEm: new Date().toISOString(),
  });

  const { data, error } = await db
    .from("categorias_vendas")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar categoria:", error);
    throw new Error("Erro ao atualizar categoria");
  }

  return snakeToCamel<CategoriaVenda>(data);
}

export async function deleteCategoria(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db.from("categorias_vendas").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir categoria:", error);
    throw new Error("Erro ao excluir categoria");
  }
}

export async function toggleCategoriaAtiva(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get current status
  const { data: categoria } = await db
    .from("categorias_vendas")
    .select("ativo")
    .eq("id", id)
    .single();

  if (!categoria) {
    throw new Error("Categoria não encontrada");
  }

  const { error } = await db
    .from("categorias_vendas")
    .update({
      ativo: !categoria.ativo,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao alternar status da categoria:", error);
    throw new Error("Erro ao alternar status da categoria");
  }
}

// ========== CRUD Vendas ==========

export async function getVendas(
  filtros?: FiltrosVenda
): Promise<VendaComCategoria[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db.from("vendas").select(`
    *,
    categorias_vendas (
      id,
      nome
    )
  `);

  // Apply filters
  if (filtros?.categoriaId) {
    query = query.eq("categoria_id", filtros.categoriaId);
  }

  if (filtros?.dataInicio) {
    query = query.gte("data", filtros.dataInicio);
  }

  if (filtros?.dataFim) {
    query = query.lte("data", filtros.dataFim);
  }

  if (filtros?.busca) {
    query = query.ilike("descricao", `%${filtros.busca}%`);
  }

  query = query.order("data", { ascending: false }).order("criado_em", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar vendas:", error);
    throw new Error("Erro ao buscar vendas");
  }

  return (data || []).map((item: any) => {
    const { categorias_vendas, ...vendaData } = item;

    return {
      ...snakeToCamel<Venda>(vendaData),
      categoria: categorias_vendas
        ? snakeToCamel<CategoriaVenda>(categorias_vendas)
        : null,
    } as VendaComCategoria;
  });
}

export async function getVendaById(id: string): Promise<VendaComCategoria | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("vendas")
    .select(`
      *,
      categorias_vendas (
        id,
        nome
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar venda:", error);
    throw new Error("Erro ao buscar venda");
  }

  const { categorias_vendas, ...vendaData } = data;

  return {
    ...snakeToCamel<Venda>(vendaData),
    categoria: categorias_vendas
      ? snakeToCamel<CategoriaVenda>(categorias_vendas)
      : null,
  } as VendaComCategoria;
}

export async function createVenda(
  formData: VendaFormData,
  usuarioId: string
): Promise<Venda> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const valorTotal = formData.quantidade * formData.valorUnitario;

  const dataToInsert = camelToSnake({
    categoriaId: formData.categoriaId || null,
    data: formData.data,
    descricao: formData.descricao,
    quantidade: formData.quantidade,
    valorUnitario: formData.valorUnitario,
    valorTotal,
    observacao: formData.observacao || null,
    registradoPor: usuarioId,
  });

  const { data, error } = await db
    .from("vendas")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar venda:", error);
    throw new Error("Erro ao criar venda");
  }

  return snakeToCamel<Venda>(data);
}

export async function updateVenda(
  id: string,
  formData: VendaFormData
): Promise<Venda> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const valorTotal = formData.quantidade * formData.valorUnitario;

  const dataToUpdate = camelToSnake({
    categoriaId: formData.categoriaId || null,
    data: formData.data,
    descricao: formData.descricao,
    quantidade: formData.quantidade,
    valorUnitario: formData.valorUnitario,
    valorTotal,
    observacao: formData.observacao || null,
    atualizadoEm: new Date().toISOString(),
  });

  const { data, error } = await db
    .from("vendas")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar venda:", error);
    throw new Error("Erro ao atualizar venda");
  }

  return snakeToCamel<Venda>(data);
}

export async function deleteVenda(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db.from("vendas").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir venda:", error);
    throw new Error("Erro ao excluir venda");
  }
}

// ========== Analytics ==========

export async function calcularTotalMesAtual(): Promise<{ total: number; quantidade: number }> {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const dataInicio = `${anoAtual}-${String(mesAtual).padStart(2, "0")}-01`;
  const dataFim = new Date(anoAtual, mesAtual, 0).toISOString().split("T")[0];

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("vendas")
    .select("valor_total")
    .gte("data", dataInicio)
    .lte("data", dataFim);

  if (error) {
    console.error("Erro ao calcular total de vendas:", error);
    return { total: 0, quantidade: 0 };
  }

  const vendas = data || [];
  return {
    total: vendas.reduce((sum: number, item: any) => sum + (item.valor_total || 0), 0),
    quantidade: vendas.length,
  };
}

export async function calcularTotalPorPeriodo(
  dataInicio: string,
  dataFim: string
): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("vendas")
    .select("valor_total")
    .gte("data", dataInicio)
    .lte("data", dataFim);

  if (error) {
    console.error("Erro ao calcular total:", error);
    return 0;
  }

  return (data || []).reduce((sum: number, item: any) => sum + (item.valor_total || 0), 0);
}

export async function obterVendasUltimas(
  limite: number = 5
): Promise<VendaComCategoria[]> {
  const vendas = await getVendas();
  return vendas.slice(0, limite);
}

export async function obterDistribuicaoPorCategoria(
  mes: number,
  ano: number
): Promise<Array<{ categoria: string; total: number; percentual: number }>> {
  const dataInicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const dataFim = new Date(ano, mes, 0).toISOString().split("T")[0];

  const vendas = await getVendas({ dataInicio, dataFim });

  const porCategoria = new Map<string, number>();
  let totalGeral = 0;

  vendas.forEach((venda) => {
    const categoriaNome = venda.categoria?.nome || "Sem Categoria";
    const valorAtual = porCategoria.get(categoriaNome) || 0;
    porCategoria.set(categoriaNome, valorAtual + venda.valorTotal);
    totalGeral += venda.valorTotal;
  });

  return Array.from(porCategoria.entries())
    .map(([categoria, total]) => ({
      categoria,
      total,
      percentual: totalGeral > 0 ? (total / totalGeral) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
