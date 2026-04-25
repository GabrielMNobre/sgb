import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getCampeonatoAtivo,
  getDemeritos,
  createDemerito,
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

    const demeritos = await getDemeritos(campeonato.id, unidadeId, data);
    return NextResponse.json(demeritos);
  } catch (error) {
    console.error("Erro ao buscar deméritos:", error);
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
    const { unidadeId, dataOcorrencia, tipoDemeritos, descricao } = body;

    if (!unidadeId || !dataOcorrencia || !tipoDemeritos) {
      return NextResponse.json(
        { error: "Campos obrigatórios: unidadeId, dataOcorrencia, tipoDemeritos" },
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

    const demerito = await createDemerito(
      campeonato.id,
      { unidadeId, dataOcorrencia, tipoDemeritos, descricao },
      user.id
    );

    return NextResponse.json(demerito, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar demérito:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao registrar demérito" },
      { status: 400 }
    );
  }
}
