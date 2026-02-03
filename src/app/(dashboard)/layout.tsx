import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type { Usuario } from "@/types/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuarioData } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!usuarioData) {
    redirect("/login");
  }

  const usuario = snakeToCamel<Usuario>(usuarioData);

  if (!usuario.ativo) {
    redirect("/login");
  }

  return <DashboardShell user={usuario}>{children}</DashboardShell>;
}
