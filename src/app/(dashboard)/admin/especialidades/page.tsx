import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { getEspecialidades } from "@/services/especialidades";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EspecialidadesTable } from "@/components/tables/especialidades-table";
import { toggleEspecialidadeStatusAction } from "./actions";

export default async function AdminEspecialidadesPage() {
  const especialidades = await getEspecialidades();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Especialidades</h1>
          <p className="text-sm sm:text-base text-gray-500">Gerencie o catálogo de especialidades</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/admin/especialidades/entregas" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto">
              <Package className="h-4 w-4 mr-2" />
              Entregas Pendentes
            </Button>
          </Link>
          <Link href="/admin/especialidades/nova" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nova Especialidade
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <EspecialidadesTable
          especialidades={especialidades}
          basePath="/admin/especialidades"
          onToggleStatus={toggleEspecialidadeStatusAction}
        />
      </Card>
    </div>
  );
}
