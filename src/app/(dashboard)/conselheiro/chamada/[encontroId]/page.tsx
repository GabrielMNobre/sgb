import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getUnidadeDoConselheiro } from "@/services/conselheiros";
import { ChamadaConselheiroClient } from "./client";

interface Props {
  params: Promise<{ encontroId: string }>;
}

export default async function ConselheiroChamadaEncontroPage({ params }: Props) {
  const { encontroId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const unidadeInfo = await getUnidadeDoConselheiro(user.id);

  if (!unidadeInfo) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Chamada</h1>
          <p className="text-sm sm:text-base text-gray-500">Faça a chamada da sua unidade</p>
        </div>

        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Users}
              title="Você não está vinculado a nenhuma unidade"
              description="Entre em contato com a secretaria para ser vinculado a uma unidade"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ChamadaConselheiroClient
      encontroId={encontroId}
      unidadeId={unidadeInfo.unidadeId}
      unidadeNome={unidadeInfo.unidadeNome}
    />
  );
}
