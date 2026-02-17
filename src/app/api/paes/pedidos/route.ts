import { NextRequest } from "next/server";
import { getPedidosPaes } from "@/services/pedidos-paes";
import type { FiltrosPedidoPaes } from "@/types/paes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filtros: FiltrosPedidoPaes = {};
    const semanaId = searchParams.get("semanaId");
    const clienteId = searchParams.get("clienteId");
    const statusPagamento = searchParams.get("statusPagamento");
    const statusEntrega = searchParams.get("statusEntrega");

    if (semanaId) filtros.semanaId = semanaId;
    if (clienteId) filtros.clienteId = clienteId;
    if (statusPagamento) filtros.statusPagamento = statusPagamento as any;
    if (statusEntrega) filtros.statusEntrega = statusEntrega as any;

    const data = await getPedidosPaes(filtros);
    return Response.json(data);
  } catch (error) {
    console.error("Erro na API de pedidos:", error);
    return Response.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}
