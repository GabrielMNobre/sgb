import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUnidadesAtivas } from "@/services/unidades";
import { RegistrarAvaliacaoClient } from "./registrar-avaliacao-client";

export default async function RegistrarAvaliacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const db = supabase as any;
  const { data: usuario } = await db
    .from("usuarios")
    .select("papel")
    .eq("id", user.id)
    .single();

  if (usuario?.papel !== "admin") redirect("/admin");

  const unidades = await getUnidadesAtivas();

  return <RegistrarAvaliacaoClient unidades={unidades} />;
}
