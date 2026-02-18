import { NextRequest, NextResponse } from "next/server";
import { getEncontros } from "@/services/encontros";
import type { FiltrosEncontro, StatusEncontro } from "@/types/encontro";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filtros: FiltrosEncontro = {
      status: (searchParams.get("status") as StatusEncontro) || undefined,
      dataInicio: searchParams.get("dataInicio") || undefined,
      dataFim: searchParams.get("dataFim") || undefined,
    };

    const encontros = await getEncontros(filtros);
    return NextResponse.json(encontros);
  } catch (error) {
    console.error("Erro na API de encontros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar encontros" },
      { status: 500 }
    );
  }
}
