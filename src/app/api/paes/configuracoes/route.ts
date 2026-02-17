import { getConfiguracoes } from "@/services/configuracoes-paes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getConfiguracoes();
    return Response.json(data);
  } catch (error) {
    console.error("Erro na API de configurações:", error);
    return Response.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}
