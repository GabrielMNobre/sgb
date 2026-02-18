import { NextRequest, NextResponse } from "next/server";
import { getResumoPresenca, getResumoPresencaPorUnidade, getResumoDiretoria } from "@/services/presencas";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [resumo, unidades, diretoria] = await Promise.all([
      getResumoPresenca(id),
      getResumoPresencaPorUnidade(id),
      getResumoDiretoria(id),
    ]);

    return NextResponse.json({ resumo, unidades, diretoria });
  } catch (error) {
    console.error("Erro na API de resumo:", error);
    return NextResponse.json(
      { error: "Erro ao buscar resumo" },
      { status: 500 }
    );
  }
}
