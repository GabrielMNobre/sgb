import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EspecialidadeForm } from "@/components/forms/especialidade-form";
import { createEspecialidadeAction } from "../actions";

export default function NovaEspecialidadePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova Especialidade</CardTitle>
        </CardHeader>
        <CardContent>
          <EspecialidadeForm onSubmit={createEspecialidadeAction} redirectPath="/admin/especialidades" />
        </CardContent>
      </Card>
    </div>
  );
}
