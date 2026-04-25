import { NextResponse } from "next/server";
import { getResultadosGerais } from "@/services/pedidos-paes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const resultados = await getResultadosGerais();
    return NextResponse.json(resultados);
  } catch (error) {
    console.error("Erro ao buscar resultados:", error);
    return NextResponse.json(
      { error: "Erro ao buscar resultados" },
      { status: 500 }
    );
  }
}
