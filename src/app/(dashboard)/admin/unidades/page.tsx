import Link from "next/link";
import { Plus } from "lucide-react";
import { getUnidades } from "@/services/unidades";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UnidadesTable } from "@/components/tables/unidades-table";
import { toggleUnidadeStatusAction } from "./actions";

export default async function AdminUnidadesPage() {
  const unidades = await getUnidades();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Unidades</h1>
          <p className="text-sm sm:text-base text-gray-500">Gerencie as unidades do clube</p>
        </div>
        <Link href="/admin/unidades/nova" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Unidade
          </Button>
        </Link>
      </div>

      <Card>
        <UnidadesTable
          unidades={unidades}
          basePath="/admin/unidades"
          onToggleStatus={toggleUnidadeStatusAction}
        />
      </Card>
    </div>
  );
}
