"use server";

import { revalidatePath } from "next/cache";
import { updateUsuario, type UsuarioFormData } from "@/services/usuarios";

export async function updateUsuarioAction(id: string, data: UsuarioFormData) {
  await updateUsuario(id, data);
  revalidatePath("/secretaria/usuarios");
  revalidatePath(`/secretaria/usuarios/${id}`);
}
