import { NextResponse } from "next/server";
import { getInadimplentes } from "@/services/pedidos-paes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const inadimplentes = await getInadimplentes();
    return NextResponse.json(inadimplentes);
  } catch (error) {
    console.error("Erro ao buscar inadimplentes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar inadimplentes" },
      { status: 500 }
    );
  }
}
