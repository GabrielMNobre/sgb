"use server";

import { revalidatePath } from "next/cache";
import {
  vincularConselheiro,
  removerVinculoConselheiro,
  definirConselheiroPrincipal,
} from "@/services/conselheiros";

export async function vincularConselheiroAction(
  unidadeId: string,
  membroId: string,
  principal: boolean
) {
  await vincularConselheiro(unidadeId, membroId, principal);
  revalidatePath("/admin/conselheiros");
}

export async function removerVinculoAction(unidadeId: string, membroId: string) {
  await removerVinculoConselheiro(unidadeId, membroId);
  revalidatePath("/admin/conselheiros");
}

export async function definirPrincipalAction(unidadeId: string, membroId: string) {
  await definirConselheiroPrincipal(unidadeId, membroId);
  revalidatePath("/admin/conselheiros");
}
