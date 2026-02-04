import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getUnidadeDoConselheiro } from "@/services/conselheiros";
import { getMembrosComEspecialidadesDaUnidade, getEspecialidadesDoMembro } from "@/services/membros-especialidades";
import { getEspecialidadesAtivas } from "@/services/especialidades";
import { EspecialidadesMembro } from "./especialidades-membro";

export default async function ConselheiroEspecialidadesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const unidadeInfo = await getUnidadeDoConselheiro(user.id);

  if (!unidadeInfo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Especialidades</h1>
          <p className="text-gray-500">Gerencie as especialidades dos membros da sua unidade</p>
        </div>

        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Users}
              title="Você não está vinculado a nenhuma unidade"
              description="Entre em contato com a secretaria para ser vinculado a uma unidade"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const [membros, especialidades] = await Promise.all([
    getMembrosComEspecialidadesDaUnidade(unidadeInfo.unidadeId),
    getEspecialidadesAtivas(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Especialidades - {unidadeInfo.unidadeNome}</h1>
        <p className="text-gray-500">Gerencie as especialidades dos membros da sua unidade</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros da Unidade</CardTitle>
        </CardHeader>
        <CardContent>
          {membros.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum membro na unidade"
              description="Não há membros ativos cadastrados nesta unidade"
            />
          ) : (
            <EspecialidadesMembro
              membros={membros}
              especialidades={especialidades}
              getEspecialidadesDoMembro={getEspecialidadesDoMembro}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
