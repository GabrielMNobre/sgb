import Link from "next/link";
import { Plus } from "lucide-react";
import { getMembros, getClasses } from "@/services/membros";
import { getUnidadesAtivas } from "@/services/unidades";
import { getHistoricoDoMembro } from "@/services/historico-classes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MembrosTable } from "./membros-table";
import type { HistoricoClasseComRelacoes } from "@/types/membro";

export default async function MembrosPage() {
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Membros</h1>
          <p className="text-sm sm:text-base text-gray-500">Gerencie os membros do clube</p>
        </div>
        <Link href="/secretaria/membros/novo" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
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
        />
      </Card>
    </div>
  );
}
