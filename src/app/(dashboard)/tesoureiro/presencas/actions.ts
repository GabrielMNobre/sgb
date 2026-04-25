"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { upsertPresencas } from "@/services/presencas";
import type { PresencaFormItem } from "@/types/encontro";

export async function salvarPresencaAction(
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

    revalidatePath("/tesoureiro/presencas");
    revalidatePath("/admin/encontros");
    revalidatePath("/admin");
    revalidatePath("/conselheiro");

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar presenças:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao salvar presenças",
    };
  }
}
