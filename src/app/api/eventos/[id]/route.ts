import { NextRequest, NextResponse } from "next/server";
import { getEventoById } from "@/services/eventos";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evento = await getEventoById(id);

    if (!evento) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(evento);
  } catch (error) {
    console.error("Erro na API de eventos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar evento" },
      { status: 500 }
    );
  }
}
