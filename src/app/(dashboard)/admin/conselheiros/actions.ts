"use server";

import { revalidatePath } from "next/cache";
import {
  vincularConselheiro,
  removerVinculoConselheiro,
  definirConselheiroPrincipal,
} from "@/services/conselheiros";

export async function vincularConselheiroAction(
  unidadeId: string,
  usuarioId: string,
  principal: boolean
) {
  await vincularConselheiro(unidadeId, usuarioId, principal);
  revalidatePath("/admin/conselheiros");
}

export async function removerVinculoAction(unidadeId: string, usuarioId: string) {
  await removerVinculoConselheiro(unidadeId, usuarioId);
  revalidatePath("/admin/conselheiros");
}

export async function definirPrincipalAction(unidadeId: string, usuarioId: string) {
  await definirConselheiroPrincipal(unidadeId, usuarioId);
  revalidatePath("/admin/conselheiros");
}
