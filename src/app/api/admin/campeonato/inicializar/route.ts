import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCampeonatoAtivo, inicializarCampeonato } from "@/services/campeonato";

async function verificarAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const db = supabase as any;
  const { data: usuario } = await db
    .from("usuarios")
    .select("papel")
    .eq("id", userId)
    .single();
  return usuario?.papel === "admin";
}

export async function POST() {
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
        { error: "Nenhum campeonato ativo encontrado" },
        { status: 404 }
      );
    }

    const resultado = await inicializarCampeonato(campeonato.id);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao inicializar campeonato:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
