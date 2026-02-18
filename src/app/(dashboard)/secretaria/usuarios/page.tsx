import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUsuarios } from "@/services/usuarios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UsuariosTable } from "./usuarios-table";

export default async function UsuariosPage() {
  const usuarios = await getUsuarios();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm sm:text-base text-gray-500">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Link href="/secretaria" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <UsuariosTable usuarios={usuarios} />
      </Card>
    </div>
  );
}
