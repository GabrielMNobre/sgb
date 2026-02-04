"use server";

import { revalidatePath } from "next/cache";
import {
  registrarConquista,
  marcarEntrega,
  removerConquista,
} from "@/services/membros-especialidades";
import type { MembroEspecialidadeFormData } from "@/types/especialidade";

export async function registrarConquistaAction(
  data: MembroEspecialidadeFormData,
  registradoPor?: string
) {
  await registrarConquista(data, registradoPor);
  revalidatePath("/conselheiro/minha-unidade/especialidades");
}

export async function marcarEntregaAction(id: string, dataEntrega: string) {
  await marcarEntrega(id, dataEntrega);
  revalidatePath("/conselheiro/minha-unidade/especialidades");
}

export async function removerConquistaAction(id: string) {
  await removerConquista(id);
  revalidatePath("/conselheiro/minha-unidade/especialidades");
}
