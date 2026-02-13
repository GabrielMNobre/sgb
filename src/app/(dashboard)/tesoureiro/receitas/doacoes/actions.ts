"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createDoacao,
  updateDoacao,
  deleteDoacao,
} from "@/services/doacoes";
import type { DoacaoFormData } from "@/types/doacao";

// ========== Doações Actions ==========

export async function criarDoacaoAction(formData: DoacaoFormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await createDoacao(formData, user.id);

    revalidatePath("/tesoureiro/receitas/doacoes");
    revalidatePath("/tesoureiro/receitas");
    revalidatePath("/tesoureiro");
    revalidatePath("/admin/financeiro/receitas/doacoes");
    revalidatePath("/admin/financeiro/receitas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar doação:", error);
    return { success: false, error: "Erro ao criar doação" };
  }
}

export async function atualizarDoacaoAction(id: string, formData: DoacaoFormData) {
  try {
    await updateDoacao(id, formData);

    revalidatePath("/tesoureiro/receitas/doacoes");
    revalidatePath("/tesoureiro/receitas");
    revalidatePath("/tesoureiro");
    revalidatePath("/admin/financeiro/receitas/doacoes");
    revalidatePath("/admin/financeiro/receitas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar doação:", error);
    return { success: false, error: "Erro ao atualizar doação" };
  }
}

export async function excluirDoacaoAction(id: string) {
  try {
    await deleteDoacao(id);

    revalidatePath("/tesoureiro/receitas/doacoes");
    revalidatePath("/tesoureiro/receitas");
    revalidatePath("/tesoureiro");
    revalidatePath("/admin/financeiro/receitas/doacoes");
    revalidatePath("/admin/financeiro/receitas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir doação:", error);
    return { success: false, error: "Erro ao excluir doação" };
  }
}
