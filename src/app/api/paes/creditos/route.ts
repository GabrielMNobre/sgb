import { NextRequest } from "next/server";
import { getCreditosByCliente } from "@/services/creditos-paes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("clienteId");

    if (!clienteId) {
      return Response.json({ error: "clienteId é obrigatório" }, { status: 400 });
    }

    const data = await getCreditosByCliente(clienteId);
    return Response.json(data);
  } catch (error) {
    console.error("Erro na API de créditos:", error);
    return Response.json({ error: "Erro ao buscar créditos" }, { status: 500 });
  }
}
