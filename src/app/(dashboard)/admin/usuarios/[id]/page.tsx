import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getUsuario } from "@/services/usuarios";
import { getMembros } from "@/services/membros";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UsuarioForm } from "./usuario-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUsuarioPage({ params }: PageProps) {
  const { id } = await params;
  const [usuario, membros] = await Promise.all([
    getUsuario(id),
    getMembros(),
  ]);

  if (!usuario) {
    notFound();
  }

  // Filtrar apenas membros da diretoria ativos
  const membrosDiretoria = membros.filter((m) => m.tipo === "diretoria" && m.ativo);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Editar Usuário</h1>
          <p className="text-sm sm:text-base text-gray-500">
            Atualize as informações do usuário
          </p>
        </div>
        <Link href="/admin/usuarios" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <UsuarioForm usuario={usuario} membrosDiretoria={membrosDiretoria} />
        </CardContent>
      </Card>
    </div>
  );
}
