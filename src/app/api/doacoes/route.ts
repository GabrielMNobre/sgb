import { NextRequest, NextResponse } from "next/server";
import { getDoacoes } from "@/services/doacoes";
import type { FiltrosDoacao } from "@/types/doacao";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filtros: FiltrosDoacao = {
      dataInicio: searchParams.get("dataInicio") || undefined,
      dataFim: searchParams.get("dataFim") || undefined,
      doador: searchParams.get("doador") || undefined,
    };

    const doacoes = await getDoacoes(filtros);

    return NextResponse.json(doacoes);
  } catch (error) {
    console.error("Erro na API de doações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar doações" },
      { status: 500 }
    );
  }
}
