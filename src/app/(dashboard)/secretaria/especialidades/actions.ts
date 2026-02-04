"use server";

import { revalidatePath } from "next/cache";
import {
  createEspecialidade,
  updateEspecialidade,
  toggleEspecialidadeStatus,
} from "@/services/especialidades";
import {
  registrarConquista,
  marcarEntrega,
  marcarEntregasEmLote,
  removerConquista,
} from "@/services/membros-especialidades";
import type { EspecialidadeFormData, MembroEspecialidadeFormData } from "@/types/especialidade";

export async function createEspecialidadeAction(data: EspecialidadeFormData) {
  await createEspecialidade(data);
  revalidatePath("/secretaria/especialidades");
}

export async function updateEspecialidadeAction(id: string, data: EspecialidadeFormData) {
  await updateEspecialidade(id, data);
  revalidatePath("/secretaria/especialidades");
}

export async function toggleEspecialidadeStatusAction(id: string, ativa: boolean) {
  await toggleEspecialidadeStatus(id, ativa);
  revalidatePath("/secretaria/especialidades");
}

export async function registrarConquistaAction(
  data: MembroEspecialidadeFormData,
  registradoPor?: string
) {
  await registrarConquista(data, registradoPor);
  revalidatePath("/secretaria/especialidades");
  revalidatePath("/conselheiro/minha-unidade/especialidades");
}

export async function marcarEntregaAction(id: string, dataEntrega: string) {
  await marcarEntrega(id, dataEntrega);
  revalidatePath("/secretaria/especialidades");
  revalidatePath("/secretaria/especialidades/entregas");
}

export async function marcarEntregasEmLoteAction(ids: string[], dataEntrega: string) {
  await marcarEntregasEmLote(ids, dataEntrega);
  revalidatePath("/secretaria/especialidades");
  revalidatePath("/secretaria/especialidades/entregas");
}

export async function removerConquistaAction(id: string) {
  await removerConquista(id);
  revalidatePath("/secretaria/especialidades");
  revalidatePath("/conselheiro/minha-unidade/especialidades");
}
