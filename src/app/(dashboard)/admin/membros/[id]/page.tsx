import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MembroForm } from "@/components/forms/membro-form";
import { getMembroById, getClasses } from "@/services/membros";
import { getUnidadesAtivas } from "@/services/unidades";
import { updateMembroAction } from "../actions";

interface EditarMembroPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarMembroPage({ params }: EditarMembroPageProps) {
  const { id } = await params;
  const [membro, unidades, classes] = await Promise.all([
    getMembroById(id),
    getUnidadesAtivas(),
    getClasses(),
  ]);

  if (!membro) {
    notFound();
  }

  const handleUpdate = async (data: Parameters<typeof updateMembroAction>[1]) => {
    "use server";
    await updateMembroAction(id, data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar Membro</CardTitle>
        </CardHeader>
        <CardContent>
          <MembroForm
            membro={membro}
            unidades={unidades}
            classes={classes}
            onSubmit={handleUpdate}
            redirectPath="/admin/membros"
          />
        </CardContent>
      </Card>
    </div>
  );
}
