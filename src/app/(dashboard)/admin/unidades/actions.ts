"use server";

import { revalidatePath } from "next/cache";
import {
  createUnidade,
  updateUnidade,
  toggleUnidadeStatus,
} from "@/services/unidades";
import type { UnidadeFormData } from "@/types/unidade";

export async function createUnidadeAction(data: UnidadeFormData) {
  await createUnidade(data);
  revalidatePath("/admin/unidades");
}

export async function updateUnidadeAction(id: string, data: UnidadeFormData) {
  await updateUnidade(id, data);
  revalidatePath("/admin/unidades");
}

export async function toggleUnidadeStatusAction(id: string, ativa: boolean) {
  await toggleUnidadeStatus(id, ativa);
  revalidatePath("/admin/unidades");
}
