import Link from "next/link";
import { Plus } from "lucide-react";
import { getMembros, getClasses } from "@/services/membros";
import { getUnidadesAtivas } from "@/services/unidades";
import { getHistoricoDoMembro } from "@/services/historico-classes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MembrosTable } from "@/components/tables/membros-table";
import { toggleMembroStatusAction, adicionarHistoricoClasseAction, removerHistoricoClasseAction } from "./actions";
import type { HistoricoClasseComRelacoes } from "@/types/membro";

export default async function AdminMembrosPage() {
  const [membros, unidades, classes] = await Promise.all([
    getMembros(),
    getUnidadesAtivas(),
    getClasses(),
  ]);

  // Buscar históricos de todos os membros
  const historicos: Record<string, HistoricoClasseComRelacoes[]> = {};
  await Promise.all(
    membros.map(async (membro) => {
      historicos[membro.id] = await getHistoricoDoMembro(membro.id);
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
          <p className="text-gray-500">Gerencie os membros do clube</p>
        </div>
        <Link href="/admin/membros/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Membro
          </Button>
        </Link>
      </div>

      <Card>
        <MembrosTable
          membros={membros}
          unidades={unidades}
          classes={classes}
          historicos={historicos}
          basePath="/admin/membros"
          onToggleStatus={toggleMembroStatusAction}
          onAddClasse={adicionarHistoricoClasseAction}
          onRemoveClasse={removerHistoricoClasseAction}
        />
      </Card>
    </div>
  );
}
