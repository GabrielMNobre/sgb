import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUnidadeDoConselheiro } from "@/services/conselheiros";
import { getHistoricoPresencasUnidade } from "@/services/conselheiro-dashboard";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const unidadeInfo = await getUnidadeDoConselheiro(user.id);
    if (!unidadeInfo)
      return NextResponse.json(
        { error: "Sem unidade vinculada" },
        { status: 403 }
      );

    const { searchParams } = new URL(request.url);
    const periodo = (searchParams.get("periodo") || "3m") as
      | "30d"
      | "3m"
      | "6m"
      | "1a";

    const historico = await getHistoricoPresencasUnidade(
      unidadeInfo.unidadeId,
      periodo
    );

    return NextResponse.json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
