import { NextRequest, NextResponse } from "next/server";
import { getMembrosDisponiveis } from "@/services/participantes-acampamento";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const membros = await getMembrosDisponiveis(id);
    return NextResponse.json(membros);
  } catch (error) {
    console.error("Erro na API de membros disponíveis:", error);
    return NextResponse.json(
      { error: "Erro ao buscar membros disponíveis" },
      { status: 500 }
    );
  }
}
