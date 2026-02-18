"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createAcampamento,
  updateAcampamento,
  deleteAcampamento,
} from "@/services/acampamentos";
import type { AcampamentoFormData } from "@/types/acampamento";

export async function criarAcampamentoAction(formData: AcampamentoFormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await createAcampamento(formData, user.id);

    revalidatePath("/tesoureiro/acampamentos");
    revalidatePath("/tesoureiro");
    revalidatePath("/admin/financeiro/acampamentos");

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar acampamento:", error);
    return { success: false, error: "Erro ao criar acampamento" };
  }
}

export async function atualizarAcampamentoAction(
  id: string,
  formData: Partial<AcampamentoFormData>
) {
  try {
    await updateAcampamento(id, formData);

    revalidatePath("/tesoureiro/acampamentos");
    revalidatePath("/tesoureiro");
    revalidatePath("/admin/financeiro/acampamentos");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar acampamento:", error);
    return { success: false, error: "Erro ao atualizar acampamento" };
  }
}

export async function excluirAcampamentoAction(id: string) {
  try {
    await deleteAcampamento(id);

    revalidatePath("/tesoureiro/acampamentos");
    revalidatePath("/tesoureiro");
    revalidatePath("/admin/financeiro/acampamentos");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir acampamento:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao excluir acampamento",
    };
  }
}
