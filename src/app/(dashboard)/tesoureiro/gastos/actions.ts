"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createGasto,
  updateGasto,
  deleteGasto,
} from "@/services/gastos";
import {
  createEvento,
  updateEvento,
  toggleEventoAtivo,
  deleteEvento,
} from "@/services/eventos";
import type { GastoFormData } from "@/types/gasto";
import type { EventoFormData } from "@/types/evento";

// ========== Gastos Actions ==========

export async function criarGastoAction(formData: GastoFormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await createGasto(formData, user.id);

    revalidatePath("/tesoureiro/gastos");
    revalidatePath("/tesoureiro");
    revalidatePath(`/tesoureiro/gastos/eventos/${formData.eventoId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar gasto:", error);
    return { success: false, error: "Erro ao criar gasto" };
  }
}

export async function atualizarGastoAction(id: string, formData: GastoFormData) {
  try {
    await updateGasto(id, formData);

    revalidatePath("/tesoureiro/gastos");
    revalidatePath("/tesoureiro");
    revalidatePath(`/tesoureiro/gastos/eventos/${formData.eventoId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar gasto:", error);
    return { success: false, error: "Erro ao atualizar gasto" };
  }
}

export async function excluirGastoAction(id: string, eventoId: string) {
  try {
    await deleteGasto(id);

    revalidatePath("/tesoureiro/gastos");
    revalidatePath("/tesoureiro");
    revalidatePath(`/tesoureiro/gastos/eventos/${eventoId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir gasto:", error);
    return { success: false, error: "Erro ao excluir gasto" };
  }
}

// ========== Eventos Actions ==========

export async function criarEventoAction(formData: EventoFormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await createEvento(formData, user.id);

    revalidatePath("/tesoureiro/gastos/eventos");

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return { success: false, error: "Erro ao criar evento" };
  }
}

export async function atualizarEventoAction(
  id: string,
  formData: EventoFormData
) {
  try {
    await updateEvento(id, formData);

    revalidatePath("/tesoureiro/gastos/eventos");
    revalidatePath(`/tesoureiro/gastos/eventos/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return { success: false, error: "Erro ao atualizar evento" };
  }
}

export async function toggleEventoAtivoAction(id: string) {
  try {
    await toggleEventoAtivo(id);

    revalidatePath("/tesoureiro/gastos/eventos");
    revalidatePath(`/tesoureiro/gastos/eventos/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status do evento:", error);
    return { success: false, error: "Erro ao atualizar status do evento" };
  }
}

export async function excluirEventoAction(id: string) {
  try {
    await deleteEvento(id);

    revalidatePath("/tesoureiro/gastos/eventos");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao excluir evento",
    };
  }
}
