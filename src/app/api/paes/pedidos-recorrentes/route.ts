import { getPedidosRecorrentesPaes } from "@/services/pedidos-recorrentes-paes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPedidosRecorrentesPaes();
    return Response.json(data);
  } catch (error) {
    console.error("Erro na API de pedidos recorrentes:", error);
    return Response.json({ error: "Erro ao buscar pedidos recorrentes" }, { status: 500 });
  }
}
