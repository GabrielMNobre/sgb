import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUnidadeDoConselheiro } from "@/services/conselheiros";
import { getMembros } from "@/services/membros";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type { Membro, MembroComRelacoes } from "@/types/membro";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const unidadeInfo = await getUnidadeDoConselheiro(user.id);
    if (!unidadeInfo)
      return NextResponse.json(
        { error: "Sem unidade vinculada" },
        { status: 403 }
      );

    const { searchParams } = new URL(request.url);
    const busca = searchParams.get("busca") || undefined;
    const classeId = searchParams.get("classeId") || undefined;
    const ativoParam = searchParams.get("ativo");
    const ativo =
      ativoParam === "false" ? false : ativoParam === "all" ? undefined : true;

    // 1. Get desbravadores (linked via membros.unidade_id)
    const desbravadores = await getMembros({
      unidadeId: unidadeInfo.unidadeId,
      busca,
      classeId,
      ativo,
    });

    // 2. Get conselheiros through conselheiros_unidades JOIN (bypasses membros RLS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { data: consVinculos } = await db
      .from("conselheiros_unidades")
      .select(`membro_id, membros (*, unidades (id, nome, cor_primaria), classes (id, nome))`)
      .eq("unidade_id", unidadeInfo.unidadeId);

    const desbravadorIdSet = new Set(desbravadores.map((d) => d.id));

    const mapped = ((consVinculos || []) as Record<string, unknown>[])
      .map((vinculo) => {
        const item = vinculo.membros as Record<string, unknown> | null;
        if (!item) return null;
        if (desbravadorIdSet.has(item.id as string)) return null;

        const membro = snakeToCamel<Membro>(item);
        const unidades = item.unidades as Record<string, unknown> | null;
        const classes = item.classes as Record<string, unknown> | null;
        return {
          ...membro,
          unidade: unidades
            ? {
                id: unidades.id as string,
                nome: unidades.nome as string,
                corPrimaria: unidades.cor_primaria as string,
              }
            : undefined,
          classe: classes
            ? {
                id: classes.id as string,
                nome: classes.nome as string,
              }
            : undefined,
        } as MembroComRelacoes;
      });
    let conselheiros = mapped.filter((c): c is MembroComRelacoes => c !== null);

    // Apply filters to conselheiros
    if (busca) {
      const buscaLower = busca.toLowerCase();
      conselheiros = conselheiros.filter((c) =>
        c.nome.toLowerCase().includes(buscaLower)
      );
    }
    if (classeId) {
      conselheiros = conselheiros.filter((c) => c.classe?.id === classeId);
    }
    if (ativo !== undefined) {
      conselheiros = conselheiros.filter((c) => c.ativo === ativo);
    }

    // 3. Merge: desbravadores first, then conselheiros
    const todosMembros = [...desbravadores, ...conselheiros];

    return NextResponse.json(todosMembros);
  } catch (error) {
    console.error("Erro ao buscar membros:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
