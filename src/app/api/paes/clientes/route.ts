import { getClientesPaes } from "@/services/clientes-paes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getClientesPaes();
    return Response.json(data);
  } catch (error) {
    console.error("Erro na API de clientes de pães:", error);
    return Response.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}
