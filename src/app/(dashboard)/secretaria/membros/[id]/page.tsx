import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MembroForm } from "@/components/forms/membro-form";
import { HistoricoClasses } from "@/components/forms/historico-classes";
import { getMembroById, getClasses } from "@/services/membros";
import { getUnidadesAtivas } from "@/services/unidades";
import { getHistoricoDoMembro } from "@/services/historico-classes";
import {
  updateMembroAction,
  adicionarHistoricoClasseAction,
  removerHistoricoClasseAction,
} from "../actions";
import type { HistoricoClasseFormData } from "@/types/membro";

interface EditarMembroPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarMembroPage({ params }: EditarMembroPageProps) {
  const { id } = await params;

  const [membro, unidades, classes, historico] = await Promise.all([
    getMembroById(id),
    getUnidadesAtivas(),
    getClasses(),
    getHistoricoDoMembro(id),
  ]);

  if (!membro) {
    notFound();
  }

  const handleUpdate = async (data: Parameters<typeof updateMembroAction>[1]) => {
    "use server";
    await updateMembroAction(id, data);
  };

  const handleAddClasse = async (data: HistoricoClasseFormData) => {
    "use server";
    await adicionarHistoricoClasseAction(id, data);
  };

  const handleRemoveClasse = async (historicoId: string) => {
    "use server";
    await removerHistoricoClasseAction(id, historicoId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <HistoricoClasses
            membroId={id}
            membroTipo={membro.tipo}
            classes={classes}
            historico={historico}
            onAdd={handleAddClasse}
            onRemove={handleRemoveClasse}
          />
        </CardContent>
      </Card>
    </div>
  );
}
