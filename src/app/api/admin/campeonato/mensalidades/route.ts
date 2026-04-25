import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getCampeonatoAtivo,
  calcularPontuacaoMensalidades,
  removerPontuacaoMensalidades,
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

    const campeonato = await getCampeonatoAtivo();
    if (!campeonato) {
      return NextResponse.json(
        { error: "Nenhum campeonato ativo" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { mes, ano } = body;

    if (!mes || !ano) {
      return NextResponse.json(
        { error: "Campos obrigatórios: mes, ano" },
        { status: 400 }
      );
    }

    if (mes < 2 || mes > 11) {
      return NextResponse.json(
        { error: "Mês deve estar entre 2 (fev) e 11 (nov)" },
        { status: 400 }
      );
    }

    const resultado = await calcularPontuacaoMensalidades(
      campeonato.id,
      mes,
      ano,
      user.id
    );

    return NextResponse.json(resultado, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao calcular mensalidades:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao calcular pontuação de mensalidades" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const campeonato = await getCampeonatoAtivo();
    if (!campeonato) {
      return NextResponse.json(
        { error: "Nenhum campeonato ativo" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mes = parseInt(searchParams.get("mes") || "0");
    const ano = parseInt(searchParams.get("ano") || "0");

    if (!mes || !ano) {
      return NextResponse.json(
        { error: "Parâmetros mes e ano são obrigatórios" },
        { status: 400 }
      );
    }

    await removerPontuacaoMensalidades(campeonato.id, mes, ano);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao remover mensalidades:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao remover pontuação" },
      { status: 400 }
    );
  }
}
