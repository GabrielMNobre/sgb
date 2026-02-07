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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Usuário</h1>
          <p className="text-gray-500">
            Atualize as informações do usuário
          </p>
        </div>
        <Link href="/admin/usuarios">
          <Button variant="outline">
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
