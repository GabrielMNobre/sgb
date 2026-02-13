"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createVenda,
  updateVenda,
  deleteVenda,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  toggleCategoriaAtiva,
} from "@/services/vendas";
import type { VendaFormData, CategoriaVendaFormData } from "@/types/venda";

// ========== Vendas Actions ==========

export async function criarVendaAction(formData: VendaFormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await createVenda(formData, user.id);

    revalidatePath("/tesoureiro/receitas/vendas");
    revalidatePath("/tesoureiro/receitas");
    revalidatePath("/tesoureiro");
    revalidatePath("/admin/financeiro/receitas/vendas");
    revalidatePath("/admin/financeiro/receitas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return { success: false, error: "Erro ao criar venda" };
  }
}

export async function atualizarVendaAction(id: string, formData: VendaFormData) {
  try {
    await updateVenda(id, formData);

    revalidatePath("/tesoureiro/receitas/vendas");
    revalidatePath("/tesoureiro/receitas");
    revalidatePath("/tesoureiro");
    revalidatePath("/admin/financeiro/receitas/vendas");
    revalidatePath("/admin/financeiro/receitas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar venda:", error);
    return { success: false, error: "Erro ao atualizar venda" };
  }
}

export async function excluirVendaAction(id: string) {
  try {
    await deleteVenda(id);

    revalidatePath("/tesoureiro/receitas/vendas");
    revalidatePath("/tesoureiro/receitas");
    revalidatePath("/tesoureiro");
    revalidatePath("/admin/financeiro/receitas/vendas");
    revalidatePath("/admin/financeiro/receitas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir venda:", error);
    return { success: false, error: "Erro ao excluir venda" };
  }
}

// ========== Categorias Actions ==========

export async function criarCategoriaAction(formData: CategoriaVendaFormData) {
  try {
    await createCategoria(formData);

    revalidatePath("/tesoureiro/receitas/vendas");
    revalidatePath("/admin/financeiro/receitas/vendas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return { success: false, error: "Erro ao criar categoria" };
  }
}

export async function atualizarCategoriaAction(
  id: string,
  formData: CategoriaVendaFormData
) {
  try {
    await updateCategoria(id, formData);

    revalidatePath("/tesoureiro/receitas/vendas");
    revalidatePath("/admin/financeiro/receitas/vendas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return { success: false, error: "Erro ao atualizar categoria" };
  }
}

export async function toggleCategoriaAtivaAction(id: string) {
  try {
    await toggleCategoriaAtiva(id);

    revalidatePath("/tesoureiro/receitas/vendas");
    revalidatePath("/admin/financeiro/receitas/vendas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status da categoria:", error);
    return { success: false, error: "Erro ao atualizar status da categoria" };
  }
}

export async function excluirCategoriaAction(id: string) {
  try {
    await deleteCategoria(id);

    revalidatePath("/tesoureiro/receitas/vendas");
    revalidatePath("/admin/financeiro/receitas/vendas");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao excluir categoria",
    };
  }
}
