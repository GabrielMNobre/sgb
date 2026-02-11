import { NextRequest, NextResponse } from "next/server";
import { getGastos } from "@/services/gastos";
import type { FiltrosGasto } from "@/types/gasto";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filtros: FiltrosGasto = {
      eventoId: searchParams.get("eventoId") || undefined,
      dataInicio: searchParams.get("dataInicio") || undefined,
      dataFim: searchParams.get("dataFim") || undefined,
      busca: searchParams.get("busca") || undefined,
    };

    const gastos = await getGastos(filtros);

    return NextResponse.json(gastos);
  } catch (error) {
    console.error("Erro na API de gastos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar gastos" },
      { status: 500 }
    );
  }
}
