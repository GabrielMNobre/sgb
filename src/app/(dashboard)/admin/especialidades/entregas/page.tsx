import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEspecialidadesPendentes } from "@/services/membros-especialidades";
import { getUnidadesAtivas } from "@/services/unidades";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EntregasManager } from "./entregas-manager";

export default async function AdminEntregasPage() {
  const [entregas, unidades] = await Promise.all([
    getEspecialidadesPendentes(),
    getUnidadesAtivas(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entregas Pendentes</h1>
          <p className="text-gray-500">
            {entregas.length} especialidade(s) aguardando entrega
          </p>
        </div>
        <Link href="/admin/especialidades">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Especialidades Pendentes de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <EntregasManager entregas={entregas} unidades={unidades} />
        </CardContent>
      </Card>
    </div>
  );
}
