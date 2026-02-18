"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { upsertPresencas } from "@/services/presencas";
import type { PresencaFormItem } from "@/types/encontro";

export async function salvarChamadaConselheiroAction(
  encontroId: string,
  presencas: PresencaFormItem[]
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await upsertPresencas(encontroId, presencas, user.id);

    revalidatePath(`/conselheiro/chamada/${encontroId}`);
    revalidatePath("/conselheiro/encontros");
    revalidatePath("/conselheiro");
    revalidatePath(`/admin/encontros/${encontroId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar chamada:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao salvar chamada",
    };
  }
}
