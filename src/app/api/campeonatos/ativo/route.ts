import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCampeonatoAtivo } from "@/services/campeonato";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const campeonato = await getCampeonatoAtivo();

    if (!campeonato) {
      return NextResponse.json(
        { error: "Nenhum campeonato ativo" },
        { status: 404 }
      );
    }

    return NextResponse.json(campeonato);
  } catch (error) {
    console.error("Erro ao buscar campeonato ativo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
