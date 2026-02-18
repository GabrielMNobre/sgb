"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  finalizarAcampamento,
} from "@/services/acampamentos";
import {
  inscreverParticipante,
  cancelarInscricao,
  marcarAutorizacao,
} from "@/services/participantes-acampamento";
import {
  createPagamento,
  deletePagamento,
} from "@/services/pagamentos-acampamento";
import { createGasto, deleteGasto } from "@/services/gastos";
import type { ParticipanteFormData, PagamentoFormData } from "@/types/acampamento";
import type { GastoFormData } from "@/types/gasto";

function revalidateAcampamento(acampamentoId: string) {
  revalidatePath(`/admin/financeiro/acampamentos/${acampamentoId}`);
  revalidatePath(`/admin/financeiro/acampamentos/${acampamentoId}/participantes`);
  revalidatePath(`/admin/financeiro/acampamentos/${acampamentoId}/pagamentos`);
  revalidatePath(`/admin/financeiro/acampamentos/${acampamentoId}/gastos`);
  revalidatePath("/admin/financeiro/acampamentos");
  revalidatePath("/admin/financeiro");
  revalidatePath(`/tesoureiro/acampamentos/${acampamentoId}`);
  revalidatePath("/tesoureiro/acampamentos");
}

export async function inscreverParticipanteAction(
  acampamentoId: string,
  formData: ParticipanteFormData
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    await inscreverParticipante(acampamentoId, formData, user.id);
    revalidateAcampamento(acampamentoId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao inscrever participante:", error);
    return { success: false, error: "Erro ao inscrever participante" };
  }
}

export async function criarPagamentoAction(
  acampamentoId: string,
  formData: PagamentoFormData
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    await createPagamento(formData, user.id);
    revalidateAcampamento(acampamentoId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return { success: false, error: "Erro ao criar pagamento" };
  }
}

export async function excluirPagamentoAction(
  acampamentoId: string,
  pagamentoId: string
) {
  try {
    await deletePagamento(pagamentoId);
    revalidateAcampamento(acampamentoId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir pagamento:", error);
    return { success: false, error: "Erro ao excluir pagamento" };
  }
}

export async function finalizarAcampamentoAction(acampamentoId: string) {
  try {
    await finalizarAcampamento(acampamentoId);
    revalidateAcampamento(acampamentoId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao finalizar acampamento:", error);
    return { success: false, error: "Erro ao finalizar acampamento" };
  }
}

export async function criarGastoAcampamentoAction(
  acampamentoId: string,
  formData: GastoFormData
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    await createGasto(formData, user.id);
    revalidateAcampamento(acampamentoId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar gasto:", error);
    return { success: false, error: "Erro ao criar gasto" };
  }
}

export async function excluirGastoAcampamentoAction(
  acampamentoId: string,
  gastoId: string
) {
  try {
    await deleteGasto(gastoId);
    revalidateAcampamento(acampamentoId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir gasto:", error);
    return { success: false, error: "Erro ao excluir gasto" };
  }
}

export async function marcarAutorizacaoAction(
  acampamentoId: string,
  participanteId: string,
  recolhida: boolean
) {
  try {
    await marcarAutorizacao(participanteId, recolhida);
    revalidateAcampamento(acampamentoId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar autorização:", error);
    return { success: false, error: "Erro ao marcar autorização" };
  }
}

export async function cancelarInscricaoAction(
  acampamentoId: string,
  participanteId: string,
  valorDevolvido: number
) {
  try {
    await cancelarInscricao(participanteId, valorDevolvido);
    revalidateAcampamento(acampamentoId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error);
    return { success: false, error: "Erro ao cancelar inscrição" };
  }
}
