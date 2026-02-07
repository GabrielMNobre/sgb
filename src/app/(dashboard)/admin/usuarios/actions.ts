"use server";

import { revalidatePath } from "next/cache";
import { updateUsuario, type UsuarioFormData } from "@/services/usuarios";

export async function updateUsuarioAction(id: string, data: UsuarioFormData) {
  await updateUsuario(id, data);
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${id}`);
}
