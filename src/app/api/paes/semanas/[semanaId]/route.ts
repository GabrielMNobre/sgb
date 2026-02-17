import { NextRequest } from "next/server";
import { getSemanaPaesComResumo } from "@/services/semanas-paes";
import { getPedidosPaesBySemana } from "@/services/pedidos-paes";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ semanaId: string }> }
) {
  try {
    const { semanaId } = await params;
    const [semana, pedidos] = await Promise.all([
      getSemanaPaesComResumo(semanaId),
      getPedidosPaesBySemana(semanaId),
    ]);

    if (!semana) {
      return Response.json({ error: "Semana não encontrada" }, { status: 404 });
    }

    return Response.json({ semana, pedidos });
  } catch (error) {
    console.error("Erro na API de semana:", error);
    return Response.json({ error: "Erro ao buscar semana" }, { status: 500 });
  }
}
