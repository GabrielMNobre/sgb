import { NextRequest, NextResponse } from "next/server";
import { getVendas } from "@/services/vendas";
import type { FiltrosVenda } from "@/types/venda";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filtros: FiltrosVenda = {
      categoriaId: searchParams.get("categoriaId") || undefined,
      dataInicio: searchParams.get("dataInicio") || undefined,
      dataFim: searchParams.get("dataFim") || undefined,
      busca: searchParams.get("busca") || undefined,
    };

    const vendas = await getVendas(filtros);

    return NextResponse.json(vendas);
  } catch (error) {
    console.error("Erro na API de vendas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vendas" },
      { status: 500 }
    );
  }
}
