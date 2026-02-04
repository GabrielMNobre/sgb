import Link from "next/link";
import { Plus } from "lucide-react";
import { getMembros, getClasses } from "@/services/membros";
import { getUnidadesAtivas } from "@/services/unidades";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MembrosTable } from "./membros-table";

export default async function MembrosPage() {
  const [membros, unidades, classes] = await Promise.all([
    getMembros(),
    getUnidadesAtivas(),
    getClasses(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
          <p className="text-gray-500">Gerencie os membros do clube</p>
        </div>
        <Link href="/secretaria/membros/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Membro
          </Button>
        </Link>
      </div>

      <Card>
        <MembrosTable membros={membros} unidades={unidades} classes={classes} />
      </Card>
    </div>
  );
}
