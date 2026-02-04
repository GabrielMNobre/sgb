import Link from "next/link";
import { Plus } from "lucide-react";
import { getUnidades } from "@/services/unidades";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UnidadesTable } from "./unidades-table";

export default async function UnidadesPage() {
  const unidades = await getUnidades();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unidades</h1>
          <p className="text-gray-500">Gerencie as unidades do clube</p>
        </div>
        <Link href="/secretaria/unidades/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Unidade
          </Button>
        </Link>
      </div>

      <Card>
        <UnidadesTable unidades={unidades} />
      </Card>
    </div>
  );
}
