import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type { ClientePaes, ClientePaesFormData } from "@/types/paes";

export async function getClientesPaes(): Promise<ClientePaes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("clientes_paes")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar clientes de pães:", error);
    throw new Error("Erro ao buscar clientes de pães");
  }

  return (data || []).map((item: any) => snakeToCamel<ClientePaes>(item));
}

export async function getClientesPaesAtivos(): Promise<ClientePaes[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("clientes_paes")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar clientes ativos:", error);
    throw new Error("Erro ao buscar clientes ativos");
  }

  return (data || []).map((item: any) => snakeToCamel<ClientePaes>(item));
}

export async function getClientePaesById(id: string): Promise<ClientePaes | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("clientes_paes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar cliente:", error);
    throw new Error("Erro ao buscar cliente");
  }

  return snakeToCamel<ClientePaes>(data);
}

export async function createClientePaes(formData: ClientePaesFormData): Promise<ClientePaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("clientes_paes")
    .insert({ nome: formData.nome })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar cliente:", error);
    throw new Error("Erro ao criar cliente");
  }

  return snakeToCamel<ClientePaes>(data);
}

export async function updateClientePaes(
  id: string,
  formData: ClientePaesFormData
): Promise<ClientePaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("clientes_paes")
    .update({ nome: formData.nome })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw new Error("Erro ao atualizar cliente");
  }

  return snakeToCamel<ClientePaes>(data);
}

export async function toggleClientePaesAtivo(id: string): Promise<ClientePaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: current, error: fetchError } = await db
    .from("clientes_paes")
    .select("ativo")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Erro ao buscar cliente:", fetchError);
    throw new Error("Erro ao buscar cliente");
  }

  const { data, error } = await db
    .from("clientes_paes")
    .update({ ativo: !current.ativo })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao alterar status do cliente:", error);
    throw new Error("Erro ao alterar status do cliente");
  }

  return snakeToCamel<ClientePaes>(data);
}
