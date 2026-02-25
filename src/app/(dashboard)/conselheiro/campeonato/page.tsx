import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUnidadeDoConselheiro } from "@/services/conselheiros";
import {
  getCampeonatoAtivo,
  getDashboardConselheiro,
  getDetalhesdia,
  getHistorico30Dias,
  getMetas,
  getEvolucaoAnual,
} from "@/services/campeonato";
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
            Você não possui uma unidade vinculada. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

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

  const hoje = new Date().toISOString().split("T")[0];

  const [dashboard, detalhesHoje, historico, metas, evolucao] =
    await Promise.all([
      getDashboardConselheiro(campeonato.id, unidadeInfo.unidadeId),
      getDetalhesdia(campeonato.id, unidadeInfo.unidadeId, hoje),
      getHistorico30Dias(campeonato.id, unidadeInfo.unidadeId),
      getMetas(campeonato.id, unidadeInfo.unidadeId),
      getEvolucaoAnual(campeonato.id, unidadeInfo.unidadeId),
    ]);

  return (
    <DashboardConselheiroClient
      dashboard={dashboard}
      detalhesHoje={detalhesHoje}
      historico={historico}
      metas={metas}
      evolucao={evolucao}
      hoje={hoje}
    />
  );
}
