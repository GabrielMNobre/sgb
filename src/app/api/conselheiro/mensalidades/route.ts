import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUnidadeDoConselheiro } from "@/services/conselheiros";
import { getMembroIdsDaUnidade } from "@/services/conselheiro-dashboard";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type { Mensalidade, MensalidadeComRelacoes } from "@/types/mensalidade";

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
    const mesParam = searchParams.get("mes");
    const anoParam = searchParams.get("ano");
    const status = searchParams.get("status") as
      | "pendente"
      | "pago"
      | "isento"
      | undefined;

    const now = new Date();
    const mes = mesParam ? parseInt(mesParam) : now.getMonth() + 1;
    const ano = anoParam ? parseInt(anoParam) : now.getFullYear();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Get ALL member IDs for this unit (desbravadores + conselheiros)
    const { todosIds } = await getMembroIdsDaUnidade(unidadeInfo.unidadeId);

    if (todosIds.length === 0) {
      return NextResponse.json({ mensalidades: [], isentos: [] });
    }

    // 1. Get mensalidades (skip if filtering only isentos)
    let mensalidades: MensalidadeComRelacoes[] = [];

    if (status !== "isento") {
      let query = db
        .from("mensalidades")
        .select(
          `*, membros (id, nome, tipo, isento_mensalidade, unidades (id, nome, cor_primaria))`
        )
        .in("membro_id", todosIds)
        .eq("mes", mes)
        .eq("ano", ano)
        .order("ano", { ascending: false })
        .order("mes", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar mensalidades:", error);
        return NextResponse.json(
          { error: "Erro ao buscar mensalidades" },
          { status: 500 }
        );
      }

      mensalidades = (data || []).map(
        (item: Record<string, unknown>) => {
          const mensalidade = snakeToCamel<Mensalidade>(item);
          const membros = item.membros as Record<string, unknown> | null;
          const unidades = membros?.unidades as Record<string, unknown> | null;

          return {
            ...mensalidade,
            membro: membros
              ? {
                  id: membros.id as string,
                  nome: membros.nome as string,
                  tipo: membros.tipo as "desbravador" | "diretoria",
                  isentoMensalidade: membros.isento_mensalidade as boolean,
                  unidade: unidades
                    ? {
                        id: unidades.id as string,
                        nome: unidades.nome as string,
                        corPrimaria: unidades.cor_primaria as string,
                      }
                    : undefined,
                }
              : {
                  id: "",
                  nome: "",
                  tipo: "desbravador" as const,
                  isentoMensalidade: false,
                },
          } as MensalidadeComRelacoes;
        }
      );
    }

    // 2. Get isento members (desbravadores via direct + conselheiros via JOIN)
    const isentos: { id: string; nome: string; tipo: string }[] = [];

    if (status !== "pago" && status !== "pendente") {
      // Desbravadores isentos
      const { data: desbIsentos } = await db
        .from("membros")
        .select("id, nome, tipo")
        .eq("unidade_id", unidadeInfo.unidadeId)
        .eq("tipo", "desbravador")
        .eq("ativo", true)
        .eq("isento_mensalidade", true)
        .order("nome");

      if (desbIsentos) {
        ((desbIsentos as Record<string, unknown>[]) || []).forEach((m) => {
          isentos.push({
            id: m.id as string,
            nome: m.nome as string,
            tipo: m.tipo as string,
          });
        });
      }

      // Conselheiros isentos (via JOIN)
      const { data: consVinculos } = await db
        .from("conselheiros_unidades")
        .select("membro_id, membros (id, nome, tipo, isento_mensalidade)")
        .eq("unidade_id", unidadeInfo.unidadeId);

      if (consVinculos) {
        ((consVinculos as Record<string, unknown>[]) || []).forEach((v) => {
          const membro = v.membros as Record<string, unknown> | null;
          if (membro && membro.isento_mensalidade === true) {
            isentos.push({
              id: membro.id as string,
              nome: membro.nome as string,
              tipo: membro.tipo as string,
            });
          }
        });
      }
    }

    return NextResponse.json({ mensalidades, isentos });
  } catch (error) {
    console.error("Erro ao buscar mensalidades:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
