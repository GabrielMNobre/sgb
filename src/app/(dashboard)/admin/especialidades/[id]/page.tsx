import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EspecialidadeForm } from "@/components/forms/especialidade-form";
import { getEspecialidadeById } from "@/services/especialidades";
import { updateEspecialidadeAction } from "../actions";

interface EditarEspecialidadePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarEspecialidadePage({ params }: EditarEspecialidadePageProps) {
  const { id } = await params;
  const especialidade = await getEspecialidadeById(id);

  if (!especialidade) {
    notFound();
  }

  const handleUpdate = async (data: Parameters<typeof updateEspecialidadeAction>[1]) => {
    "use server";
    await updateEspecialidadeAction(id, data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar Especialidade</CardTitle>
        </CardHeader>
        <CardContent>
          <EspecialidadeForm
            especialidade={especialidade}
            onSubmit={handleUpdate}
            redirectPath="/admin/especialidades"
          />
        </CardContent>
      </Card>
    </div>
  );
}
