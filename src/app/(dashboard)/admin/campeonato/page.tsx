import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getCampeonatoAtivo,
  getDashboardExecutivo,
  getAtividadeGeral,
  getStatusClasses,
} from "@/services/campeonato";
import { DashboardExecutivoClient } from "./dashboard-executivo-client";

export default async function AdminCampeonatoPage() {
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

  const campeonato = await getCampeonatoAtivo();

  if (!campeonato) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">Nenhum campeonato ativo no momento.</p>
        </div>
      </div>
    );
  }

  const [dashboardData, atividade, statusClasses] = await Promise.all([
    getDashboardExecutivo(campeonato.id),
    getAtividadeGeral(campeonato.id),
    getStatusClasses(campeonato.id),
  ]);

  return (
    <DashboardExecutivoClient
      dashboard={dashboardData}
      atividade={atividade}
      statusClasses={statusClasses}
      campeonato={campeonato}
    />
  );
}
