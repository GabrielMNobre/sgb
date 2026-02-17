import { getSemanasPaesComResumo } from "@/services/semanas-paes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSemanasPaesComResumo();
    return Response.json(data);
  } catch (error) {
    console.error("Erro na API de semanas:", error);
    return Response.json({ error: "Erro ao buscar semanas" }, { status: 500 });
  }
}
