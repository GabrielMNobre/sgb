"use server";

import { revalidatePath } from "next/cache";
import {
  createMembro,
  updateMembro,
  toggleMembroStatus,
} from "@/services/membros";
import type { MembroFormData } from "@/types/membro";

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
