import { NextRequest, NextResponse } from "next/server";
import { getMembrosParaChamada } from "@/services/presencas";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const unidadeId = request.nextUrl.searchParams.get("unidadeId") || undefined;
    const tipo = (request.nextUrl.searchParams.get("tipo") || undefined) as "diretoria" | undefined;

    const membros = await getMembrosParaChamada(id, unidadeId, tipo);
    return NextResponse.json(membros);
  } catch (error) {
    console.error("Erro na API de presenças:", error);
    return NextResponse.json(
      { error: "Erro ao buscar presenças" },
      { status: 500 }
    );
  }
}
