import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUnidadeDoConselheiro } from "@/services/conselheiros";
import { getMembroDetalhesConselheiro } from "@/services/conselheiro-dashboard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ membroId: string }> }
) {
  try {
    const { membroId } = await params;
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

    const membro = await getMembroDetalhesConselheiro(
      membroId,
      unidadeInfo.unidadeId
    );
    if (!membro)
      return NextResponse.json(
        { error: "Membro não encontrado" },
        { status: 404 }
      );

    return NextResponse.json(membro);
  } catch (error) {
    console.error("Erro ao buscar detalhes do membro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
