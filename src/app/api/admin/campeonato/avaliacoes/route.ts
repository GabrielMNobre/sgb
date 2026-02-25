import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getCampeonatoAtivo,
  getAvaliacoes,
  createAvaliacao,
} from "@/services/campeonato";

async function verificarAdmin(supabase: any, userId: string): Promise<boolean> {
  const db = supabase as any;
  const { data: usuario } = await db
    .from("usuarios")
    .select("papel")
    .eq("id", userId)
    .single();
  return usuario?.papel === "admin";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const isAdmin = await verificarAdmin(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const unidadeId = searchParams.get("unidade_id");
    const data = searchParams.get("data");

    if (!unidadeId || !data) {
      return NextResponse.json(
        { error: "unidade_id e data são obrigatórios" },
        { status: 400 }
      );
    }

    const campeonato = await getCampeonatoAtivo();
    if (!campeonato) {
      return NextResponse.json(
        { error: "Nenhum campeonato ativo" },
        { status: 404 }
      );
    }

    const avaliacoes = await getAvaliacoes(campeonato.id, unidadeId, data);
    return NextResponse.json(avaliacoes);
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const isAdmin = await verificarAdmin(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { unidadeId, dataAvaliacao, categoria, tipoAvaliacao, cor, descricao } =
      body;

    if (!unidadeId || !dataAvaliacao || !categoria || !tipoAvaliacao || !cor) {
      return NextResponse.json(
        { error: "Campos obrigatórios: unidadeId, dataAvaliacao, categoria, tipoAvaliacao, cor" },
        { status: 400 }
      );
    }

    const campeonato = await getCampeonatoAtivo();
    if (!campeonato) {
      return NextResponse.json(
        { error: "Nenhum campeonato ativo" },
        { status: 404 }
      );
    }

    const avaliacao = await createAvaliacao(
      campeonato.id,
      { unidadeId, dataAvaliacao, categoria, tipoAvaliacao, cor, descricao },
      user.id
    );

    return NextResponse.json(avaliacao, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar avaliação:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao registrar avaliação" },
      { status: 400 }
    );
  }
}
