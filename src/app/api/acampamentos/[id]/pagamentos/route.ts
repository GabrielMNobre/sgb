import { NextRequest, NextResponse } from "next/server";
import { getPagamentos } from "@/services/pagamentos-acampamento";
import type { FiltrosPagamento } from "@/types/acampamento";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const filtros: FiltrosPagamento = {
      dataInicio: searchParams.get("dataInicio") || undefined,
      dataFim: searchParams.get("dataFim") || undefined,
      participanteId: searchParams.get("participanteId") || undefined,
    };

    const pagamentos = await getPagamentos(id, filtros);
    return NextResponse.json(pagamentos);
  } catch (error) {
    console.error("Erro na API de pagamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pagamentos" },
      { status: 500 }
    );
  }
}
