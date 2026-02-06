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
} from "@/services/historico-classes";
import type { MembroFormData, HistoricoClasseFormData } from "@/types/membro";

export async function createMembroAction(data: MembroFormData) {
  await createMembro(data);
  revalidatePath("/secretaria/membros");
}

export async function updateMembroAction(id: string, data: MembroFormData) {
  await updateMembro(id, data);
  revalidatePath("/secretaria/membros");
}

export async function toggleMembroStatusAction(id: string, ativo: boolean) {
  await toggleMembroStatus(id, ativo);
  revalidatePath("/secretaria/membros");
}

export async function adicionarHistoricoClasseAction(membroId: string, data: HistoricoClasseFormData) {
  await adicionarHistoricoClasse(membroId, data);
  revalidatePath(`/secretaria/membros/${membroId}`);
}

export async function removerHistoricoClasseAction(membroId: string, historicoId: string) {
  await removerHistoricoClasse(historicoId);
  revalidatePath(`/secretaria/membros/${membroId}`);
}
