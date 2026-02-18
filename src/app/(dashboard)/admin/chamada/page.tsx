import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEncontroEmAndamento } from "@/services/encontros";

export default async function AdminChamadaPage() {
  const encontro = await getEncontroEmAndamento();

  if (encontro) {
    redirect(`/admin/encontros/${encontro.id}/chamada`);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Chamada</h1>
        <p className="text-sm sm:text-base text-gray-500">Faça a chamada dos encontros</p>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">Nenhum encontro em andamento no momento</p>
            <Link href="/admin/encontros">
              <Button variant="outline">
                <ClipboardList className="h-4 w-4 mr-2" />
                Ver Encontros
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
