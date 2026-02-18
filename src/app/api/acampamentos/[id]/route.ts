import { NextRequest, NextResponse } from "next/server";
import { getAcampamentoById, calcularResumo } from "@/services/acampamentos";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const acampamento = await getAcampamentoById(id);

    if (!acampamento) {
      return NextResponse.json(
        { error: "Acampamento não encontrado" },
        { status: 404 }
      );
    }

    const resumo = await calcularResumo(id);

    return NextResponse.json({ acampamento, resumo });
  } catch (error) {
    console.error("Erro na API de acampamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar acampamento" },
      { status: 500 }
    );
  }
}
