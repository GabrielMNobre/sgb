import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEncontroById } from "@/services/encontros";
import {
  getCampeonatoAtivo,
  getDinamicasEncontro,
  createDinamica,
  deleteDinamica,
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const encontro = await getEncontroById(id);
    if (!encontro) {
      return NextResponse.json({ error: "Encontro não encontrado" }, { status: 404 });
    }

    const campeonato = await getCampeonatoAtivo();
    if (!campeonato) {
      return NextResponse.json({ error: "Nenhum campeonato ativo" }, { status: 404 });
    }

    const dinamicas = await getDinamicasEncontro(campeonato.id, encontro.data);
    return NextResponse.json(dinamicas);
  } catch (error) {
    console.error("Erro ao buscar dinâmicas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const encontro = await getEncontroById(id);
    if (!encontro) {
      return NextResponse.json({ error: "Encontro não encontrado" }, { status: 404 });
    }

    if (encontro.status === "agendado") {
      return NextResponse.json(
        { error: "Encontro deve estar em andamento ou finalizado para registrar dinâmicas" },
        { status: 400 }
      );
    }

    const campeonato = await getCampeonatoAtivo();
    if (!campeonato) {
      return NextResponse.json({ error: "Nenhum campeonato ativo" }, { status: 404 });
    }

    const body = await request.json();
    const { nome, tipo, resultados } = body;

    if (!nome || !tipo || !resultados?.length) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, tipo, resultados" },
        { status: 400 }
      );
    }

    const avaliacoes = await createDinamica(
      campeonato.id,
      encontro.data,
      nome,
      tipo,
      resultados,
      user.id
    );

    return NextResponse.json(avaliacoes, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar dinâmica:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao registrar dinâmica" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const encontro = await getEncontroById(id);
    if (!encontro) {
      return NextResponse.json({ error: "Encontro não encontrado" }, { status: 404 });
    }

    if (encontro.status === "agendado") {
      return NextResponse.json(
        { error: "Encontro deve estar em andamento ou finalizado para deletar dinâmicas" },
        { status: 400 }
      );
    }

    const campeonato = await getCampeonatoAtivo();
    if (!campeonato) {
      return NextResponse.json({ error: "Nenhum campeonato ativo" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const nomeDinamica = searchParams.get("nome");

    if (!nomeDinamica) {
      return NextResponse.json(
        { error: "Parâmetro nome é obrigatório" },
        { status: 400 }
      );
    }

    await deleteDinamica(campeonato.id, encontro.data, nomeDinamica);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar dinâmica:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao deletar dinâmica" },
      { status: 400 }
    );
  }
}
