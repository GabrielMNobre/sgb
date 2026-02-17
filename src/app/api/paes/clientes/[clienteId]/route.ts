import { NextRequest } from "next/server";
import { getClientePaesById } from "@/services/clientes-paes";
import { getPedidosPaesByCliente } from "@/services/pedidos-paes";
import { getCreditosByCliente, getTotalCreditosDisponiveis } from "@/services/creditos-paes";
import { getPedidosRecorrentesByCliente } from "@/services/pedidos-recorrentes-paes";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clienteId: string }> }
) {
  try {
    const { clienteId } = await params;
    const [cliente, pedidos, creditos, totalCreditos, recorrentes] = await Promise.all([
      getClientePaesById(clienteId),
      getPedidosPaesByCliente(clienteId),
      getCreditosByCliente(clienteId),
      getTotalCreditosDisponiveis(clienteId),
      getPedidosRecorrentesByCliente(clienteId),
    ]);

    if (!cliente) {
      return Response.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return Response.json({
      cliente,
      pedidos,
      creditos,
      totalCreditos,
      recorrentes,
    });
  } catch (error) {
    console.error("Erro na API de cliente:", error);
    return Response.json({ error: "Erro ao buscar cliente" }, { status: 500 });
  }
}
