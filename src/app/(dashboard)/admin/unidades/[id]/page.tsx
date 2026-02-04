import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UnidadeForm } from "@/components/forms/unidade-form";
import { getUnidadeById } from "@/services/unidades";
import { updateUnidadeAction } from "../actions";

interface EditarUnidadePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarUnidadePage({ params }: EditarUnidadePageProps) {
  const { id } = await params;
  const unidade = await getUnidadeById(id);

  if (!unidade) {
    notFound();
  }

  const handleUpdate = async (data: Parameters<typeof updateUnidadeAction>[1]) => {
    "use server";
    await updateUnidadeAction(id, data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar Unidade</CardTitle>
        </CardHeader>
        <CardContent>
          <UnidadeForm unidade={unidade} onSubmit={handleUpdate} redirectPath="/admin/unidades" />
        </CardContent>
      </Card>
    </div>
  );
}
