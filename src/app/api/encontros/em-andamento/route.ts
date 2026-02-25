import { getEncontroEmAndamento } from "@/services/encontros";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const encontro = await getEncontroEmAndamento();
    if (!encontro) {
      return NextResponse.json(null, { status: 404 });
    }
    return NextResponse.json(encontro);
  } catch (error) {
    console.error("Erro ao buscar encontro em andamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar encontro em andamento" },
      { status: 500 }
    );
  }
}
