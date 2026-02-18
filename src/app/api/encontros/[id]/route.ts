import { NextRequest, NextResponse } from "next/server";
import { getEncontroById } from "@/services/encontros";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const encontro = await getEncontroById(id);

    if (!encontro) {
      return NextResponse.json(
        { error: "Encontro não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(encontro);
  } catch (error) {
    console.error("Erro na API de encontro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar encontro" },
      { status: 500 }
    );
  }
}
