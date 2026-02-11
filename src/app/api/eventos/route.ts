import { NextRequest, NextResponse } from "next/server";
import { getEventos, getEventosComGastos } from "@/services/eventos";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const comGastos = searchParams.get("comGastos") === "true";
    const apenasAtivos = searchParams.get("apenasAtivos") === "true";

    const eventos = comGastos
      ? await getEventosComGastos()
      : await getEventos(apenasAtivos);

    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Erro na API de eventos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar eventos" },
      { status: 500 }
    );
  }
}
