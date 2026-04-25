import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUnidadeDoConselheiro } from "@/services/conselheiros";
import { getCampeonatoAtivo, getMetas } from "@/services/campeonato";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const unidadeInfo = await getUnidadeDoConselheiro(user.id);
    if (!unidadeInfo) {
      return NextResponse.json(
        { error: "Sem unidade vinculada" },
        { status: 403 }
      );
    }

    const campeonato = await getCampeonatoAtivo();
    if (!campeonato) {
      return NextResponse.json(
        { error: "Nenhum campeonato ativo" },
        { status: 404 }
      );
    }

    const metas = await getMetas(campeonato.id, unidadeInfo.unidadeId);

    return NextResponse.json(metas);
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
