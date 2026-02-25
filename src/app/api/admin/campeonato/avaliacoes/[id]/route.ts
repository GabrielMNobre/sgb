import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteAvaliacao } from "@/services/campeonato";

async function verificarAdmin(supabase: any, userId: string): Promise<boolean> {
  const db = supabase as any;
  const { data: usuario } = await db
    .from("usuarios")
    .select("papel")
    .eq("id", userId)
    .single();
  return usuario?.papel === "admin";
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

    await deleteAvaliacao(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar avaliação:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao deletar avaliação" },
      { status: 500 }
    );
  }
}
