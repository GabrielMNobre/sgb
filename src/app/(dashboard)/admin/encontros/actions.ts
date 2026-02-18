"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createEncontro,
  updateEncontro,
  deleteEncontro,
  iniciarEncontro,
  finalizarEncontro,
} from "@/services/encontros";
import { upsertPresencas } from "@/services/presencas";
import type { EncontroFormData, PresencaFormItem } from "@/types/encontro";

function revalidateEncontros(encontroId?: string) {
  revalidatePath("/admin/encontros");
  revalidatePath("/admin");
  revalidatePath("/conselheiro");
  revalidatePath("/conselheiro/encontros");
  if (encontroId) {
    revalidatePath(`/admin/encontros/${encontroId}`);
    revalidatePath(`/admin/encontros/${encontroId}/chamada`);
  }
}

export async function criarEncontroAction(formData: EncontroFormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await createEncontro(formData, user.id);
    revalidateEncontros();

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar encontro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar encontro",
    };
  }
}

export async function atualizarEncontroAction(
  id: string,
  formData: Partial<EncontroFormData>
) {
  try {
    await updateEncontro(id, formData);
    revalidateEncontros(id);

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar encontro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar encontro",
    };
  }
}

export async function excluirEncontroAction(id: string) {
  try {
    await deleteEncontro(id);
    revalidateEncontros();

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir encontro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir encontro",
    };
  }
}

export async function iniciarEncontroAction(id: string) {
  try {
    await iniciarEncontro(id);
    revalidateEncontros(id);

    return { success: true };
  } catch (error) {
    console.error("Erro ao iniciar encontro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao iniciar encontro",
    };
  }
}

export async function finalizarEncontroAction(id: string) {
  try {
    await finalizarEncontro(id);
    revalidateEncontros(id);

    return { success: true };
  } catch (error) {
    console.error("Erro ao finalizar encontro:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao finalizar encontro",
    };
  }
}

export async function salvarChamadaAction(
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
    revalidateEncontros(encontroId);

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar chamada:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao salvar chamada",
    };
  }
}
