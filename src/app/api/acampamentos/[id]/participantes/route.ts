import { NextRequest, NextResponse } from "next/server";
import { getParticipantes } from "@/services/participantes-acampamento";
import type { FiltrosParticipante, StatusParticipante } from "@/types/acampamento";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const filtros: FiltrosParticipante = {
      status: (searchParams.get("status") as StatusParticipante) || undefined,
      situacaoPagamento: (searchParams.get("situacaoPagamento") as FiltrosParticipante["situacaoPagamento"]) || undefined,
      autorizacao: (searchParams.get("autorizacao") as FiltrosParticipante["autorizacao"]) || undefined,
      busca: searchParams.get("busca") || undefined,
    };

    const participantes = await getParticipantes(id, filtros);
    return NextResponse.json(participantes);
  } catch (error) {
    console.error("Erro na API de participantes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar participantes" },
      { status: 500 }
    );
  }
}
