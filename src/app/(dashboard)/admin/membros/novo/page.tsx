import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MembroForm } from "@/components/forms/membro-form";
import { getUnidadesAtivas } from "@/services/unidades";
import { getClasses } from "@/services/membros";
import { createMembroAction } from "../actions";

export default async function NovoMembroPage() {
  const [unidades, classes] = await Promise.all([
    getUnidadesAtivas(),
    getClasses(),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Novo Membro</CardTitle>
        </CardHeader>
        <CardContent>
          <MembroForm
            unidades={unidades}
            classes={classes}
            onSubmit={createMembroAction}
            redirectPath="/admin/membros"
          />
        </CardContent>
      </Card>
    </div>
  );
}
