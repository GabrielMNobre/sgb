import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getCampeonatoAtivo,
  getClassesUnidade,
  updateClassesUnidade,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unidade_id: string }> }
) {
  try {
    const { unidade_id } = await params;

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

    const campeonato = await getCampeonatoAtivo();
    if (!campeonato) {
      return NextResponse.json(
        { error: "Nenhum campeonato ativo" },
        { status: 404 }
      );
    }

    const classes = await getClassesUnidade(campeonato.id, unidade_id);
    return NextResponse.json(classes);
  } catch (error) {
    console.error("Erro ao buscar classes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ unidade_id: string }> }
) {
  try {
    const { unidade_id } = await params;

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

    const campeonato = await getCampeonatoAtivo();
    if (!campeonato) {
      return NextResponse.json(
        { error: "Nenhum campeonato ativo" },
        { status: 404 }
      );
    }

    const classes = await updateClassesUnidade(campeonato.id, unidade_id, body);
    return NextResponse.json(classes);
  } catch (error: any) {
    console.error("Erro ao atualizar classes:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar classes" },
      { status: 400 }
    );
  }
}
