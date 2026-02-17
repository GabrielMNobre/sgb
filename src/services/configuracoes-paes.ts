import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type { ConfiguracoesPaes, ConfiguracoesPaesFormData } from "@/types/paes";

export async function getConfiguracoes(): Promise<ConfiguracoesPaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("configuracoes_paes")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Erro ao buscar configurações de pães:", error);
    // Return defaults if no config row exists
    return {
      id: "",
      valorUnitarioPadrao: 10.0,
      paesPorFornada: 12,
      atualizadoEm: new Date(),
    };
  }

  return snakeToCamel<ConfiguracoesPaes>(data);
}

export async function updateConfiguracoes(
  formData: ConfiguracoesPaesFormData
): Promise<ConfiguracoesPaes> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get current config id
  const { data: current } = await db
    .from("configuracoes_paes")
    .select("id")
    .limit(1)
    .single();

  if (current) {
    const { data, error } = await db
      .from("configuracoes_paes")
      .update(camelToSnake({
        valorUnitarioPadrao: formData.valorUnitarioPadrao,
        paesPorFornada: formData.paesPorFornada,
        atualizadoEm: new Date().toISOString(),
      }))
      .eq("id", current.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar configurações:", error);
      throw new Error("Erro ao atualizar configurações");
    }

    return snakeToCamel<ConfiguracoesPaes>(data);
  } else {
    // Insert if no config exists
    const { data, error } = await db
      .from("configuracoes_paes")
      .insert(camelToSnake({
        valorUnitarioPadrao: formData.valorUnitarioPadrao,
        paesPorFornada: formData.paesPorFornada,
      }))
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar configurações:", error);
      throw new Error("Erro ao criar configurações");
    }

    return snakeToCamel<ConfiguracoesPaes>(data);
  }
}
