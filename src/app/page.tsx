import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PapelUsuario } from "@/types/auth";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("papel")
      .eq("id", user.id)
      .single();

    const routes: Record<string, string> = {
      admin: "/admin",
      secretaria: "/secretaria",
      tesoureiro: "/tesoureiro",
      conselheiro: "/conselheiro",
    };

    const papel = (usuario as { papel: PapelUsuario } | null)?.papel;
    redirect(routes[papel || ""] || "/login");
  }

  redirect("/login");
}
