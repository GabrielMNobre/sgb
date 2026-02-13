import { NextResponse } from "next/server";
import { getCategorias } from "@/services/vendas";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categorias = await getCategorias();

    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Erro na API de categorias de vendas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar categorias" },
      { status: 500 }
    );
  }
}
