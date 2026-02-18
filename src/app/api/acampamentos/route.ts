import { NextRequest, NextResponse } from "next/server";
import { getAcampamentos } from "@/services/acampamentos";
import type { FiltrosAcampamento, StatusAcampamento } from "@/types/acampamento";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filtros: FiltrosAcampamento = {
      status: (searchParams.get("status") as StatusAcampamento) || undefined,
      ano: searchParams.get("ano") ? Number(searchParams.get("ano")) : undefined,
    };

    const acampamentos = await getAcampamentos(filtros);
    return NextResponse.json(acampamentos);
  } catch (error) {
    console.error("Erro na API de acampamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar acampamentos" },
      { status: 500 }
    );
  }
}
