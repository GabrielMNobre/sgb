"use server";

import { revalidatePath } from "next/cache";
import {
  createMembro,
  updateMembro,
  toggleMembroStatus,
} from "@/services/membros";
import {
  adicionarHistoricoClasse,
  removerHistoricoClasse,
  atualizarClasseAtualDoMembro,
} from "@/services/historico-classes";
import type { MembroFormData, HistoricoClasseFormData } from "@/types/membro";

export async function createMembroAction(data: MembroFormData) {
  await createMembro(data);
  revalidatePath("/admin/membros");
}

export async function updateMembroAction(id: string, data: MembroFormData) {
  await updateMembro(id, data);
  revalidatePath("/admin/membros");
}

export async function toggleMembroStatusAction(id: string, ativo: boolean) {
  await toggleMembroStatus(id, ativo);
  revalidatePath("/admin/membros");
}

export async function adicionarHistoricoClasseAction(membroId: string, data: HistoricoClasseFormData) {
  await adicionarHistoricoClasse(membroId, data);
  await atualizarClasseAtualDoMembro(membroId);
  revalidatePath(`/admin/membros/${membroId}`);
  revalidatePath("/admin/membros");
}

export async function removerHistoricoClasseAction(membroId: string, historicoId: string) {
  await removerHistoricoClasse(historicoId);
  await atualizarClasseAtualDoMembro(membroId);
  revalidatePath(`/admin/membros/${membroId}`);
  revalidatePath("/admin/membros");
}
