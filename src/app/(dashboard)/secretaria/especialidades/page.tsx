import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { getEspecialidades } from "@/services/especialidades";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EspecialidadesTable } from "./especialidades-table";

export default async function EspecialidadesPage() {
  const especialidades = await getEspecialidades();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Especialidades</h1>
          <p className="text-gray-500">Gerencie o catálogo de especialidades</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/secretaria/especialidades/entregas">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Entregas Pendentes
            </Button>
          </Link>
          <Link href="/secretaria/especialidades/nova">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Especialidade
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <EspecialidadesTable especialidades={especialidades} />
      </Card>
    </div>
  );
}
