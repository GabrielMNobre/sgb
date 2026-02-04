import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UnidadeForm } from "@/components/forms/unidade-form";
import { createUnidadeAction } from "../actions";

export default function NovaUnidadePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova Unidade</CardTitle>
        </CardHeader>
        <CardContent>
          <UnidadeForm onSubmit={createUnidadeAction} />
        </CardContent>
      </Card>
    </div>
  );
}
