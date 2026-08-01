export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUnidadeDoConselheiro } from "@/services/conselheiros";
import {
  getCampeonatoAtivo,
  getDashboardConselheiro,
  getDetalhesdia,
} from "@/services/campeonato";
import { getEncontroEmAndamento } from "@/services/encontros";
import { DashboardConselheiroClient } from "./dashboard-client";

export default async function CampeonatoConselheiroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const unidadeInfo = await getUnidadeDoConselheiro(user.id);

  if (!unidadeInfo) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Você não possui uma unidade vinculada. Entre em contato com o
            administrador.
          </p>
        </div>
      </div>
    );
  }

  const [campeonato, encontroAtivo] = await Promise.all([
    getCampeonatoAtivo(),
    getEncontroEmAndamento(),
  ]);

  if (!campeonato) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">Nenhum campeonato ativo no momento.</p>
        </div>
      </div>
    );
  }

  if (!encontroAtivo) {
    const dashboard = await getDashboardConselheiro(
      campeonato.id,
      unidadeInfo.unidadeId
    );

    return (
      <DashboardConselheiroClient
        dashboard={dashboard}
        detalhesEncontro={null}
        encontroData={null}
      />
    );
  }

  const [dashboard, detalhesEncontro] = await Promise.all([
    getDashboardConselheiro(campeonato.id, unidadeInfo.unidadeId),
    getDetalhesdia(campeonato.id, unidadeInfo.unidadeId, encontroAtivo.data),
  ]);

  return (
    <DashboardConselheiroClient
      dashboard={dashboard}
      detalhesEncontro={detalhesEncontro}
      encontroData={encontroAtivo.data}
    />
  );
}
