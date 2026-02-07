import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUsuarios } from "@/services/usuarios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UsuariosTable } from "./usuarios-table";

export default async function UsuariosPage() {
  const usuarios = await getUsuarios();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-500">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline">
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
