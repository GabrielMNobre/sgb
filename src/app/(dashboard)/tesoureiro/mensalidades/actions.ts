"use server";

import { revalidatePath } from "next/cache";
import {
  gerarMensalidadesDoMes,
  registrarPagamentos,
  estornarPagamento,
} from "@/services/mensalidades";
import type { RegistrarPagamentoFormData } from "@/types/mensalidade";

export async function gerarMensalidadesDoMesAction(mes: number, ano: number) {
  const resultado = await gerarMensalidadesDoMes(mes, ano);
  revalidatePath("/tesoureiro/mensalidades");
  revalidatePath("/tesoureiro");
  return resultado;
}

export async function registrarPagamentosAction(
  data: RegistrarPagamentoFormData
) {
  await registrarPagamentos(data);
  revalidatePath("/tesoureiro/mensalidades");
  revalidatePath("/tesoureiro");
}

export async function estornarPagamentoAction(id: string) {
  await estornarPagamento(id);
  revalidatePath("/tesoureiro/mensalidades");
  revalidatePath("/tesoureiro");
}
