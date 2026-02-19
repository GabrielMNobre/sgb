import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, BarChart3, Building2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import {
  getUnidadeDoConselheiroCompleta,
  getDesbravadoresPorClasseUnidade,
  getEstatisticasPresencaUnidade,
  getConselheiroIdsDaUnidade,
} from "@/services/conselheiro-dashboard";
import { getMembros } from "@/services/membros";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type { Membro, MembroComRelacoes } from "@/types/membro";

function getPercentageColor(value: number) {
  if (value >= 80) return "text-green-600";
  if (value >= 50) return "text-amber-600";
  return "text-red-600";
}

export default async function MinhaUnidadePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let unidadeInfo: Awaited<
    ReturnType<typeof getUnidadeDoConselheiroCompleta>
  > = null;
  let classeBreakdown: { classeNome: string; quantidade: number }[] = [];
  let estatisticas = {
    taxaPresenca: 0,
    taxaPontualidade: 0,
    taxaMaterial: 0,
    taxaUniforme: 0,
    totalEncontros: 0,
  };
  let membros: MembroComRelacoes[] = [];

  try {
    unidadeInfo = await getUnidadeDoConselheiroCompleta(user.id);

    if (unidadeInfo) {
      const [classeBreakdownResult, estatisticasResult, desbravadores, conselheiroMemberIds] =
        await Promise.all([
          getDesbravadoresPorClasseUnidade(unidadeInfo.unidadeId),
          getEstatisticasPresencaUnidade(unidadeInfo.unidadeId),
          getMembros({ unidadeId: unidadeInfo.unidadeId, ativo: true }),
          getConselheiroIdsDaUnidade(unidadeInfo.unidadeId),
        ]);

      classeBreakdown = classeBreakdownResult;
      estatisticas = estatisticasResult;

      // Fetch conselheiro members through conselheiros_unidades JOIN (bypasses membros RLS)
      const desbravadorIdSet = new Set(desbravadores.map((d) => d.id));

      let conselheiros: MembroComRelacoes[] = [];
      if (conselheiroMemberIds.length > 0) {
        const supabaseDb = await createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabaseDb as any;

        const { data: consVinculos } = await db
          .from("conselheiros_unidades")
          .select(`membro_id, membros (*, unidades (id, nome, cor_primaria), classes (id, nome))`)
          .eq("unidade_id", unidadeInfo.unidadeId);

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
        conselheiros = mapped.filter((c): c is MembroComRelacoes => c !== null);
      }

      membros = [...desbravadores, ...conselheiros];
    }
  } catch (error) {
    console.error("Erro ao carregar dados da unidade:", error);
  }

  if (!unidadeInfo) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Minha Unidade
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Sem unidade vinculada
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">
                Voce nao esta vinculado a nenhuma unidade
              </p>
              <p className="text-sm text-gray-400">
                Entre em contato com a secretaria para ser vinculado a uma
                unidade
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Total membros includes desbravadores + conselheiros
  const totalMembros = membros.length;

  const primeiros5Membros = membros.slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Minha Unidade
        </h1>
        <p
          className="text-sm sm:text-base font-medium"
          style={{ color: "var(--unit-primary)" }}
        >
          {unidadeInfo.unidadeNome}
        </p>
      </div>

      {/* Unit Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {/* Color swatch */}
            <div
              className="w-16 h-16 rounded-lg flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, var(--unit-primary), var(--unit-secondary))`,
              }}
            />
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--unit-primary)" }}>
                {unidadeInfo.unidadeNome}
              </h2>
              {unidadeInfo.descricao && (
                <p className="text-gray-500 mt-1">{unidadeInfo.descricao}</p>
              )}
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Conselheiros:</p>
                <div className="flex flex-wrap gap-2">
                  {unidadeInfo.conselheiros.map((c) => (
                    <Badge
                      key={c.nome}
                      variant={c.principal ? "default" : "outline"}
                    >
                      {c.nome}
                      {c.principal ? " (Principal)" : ""}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Total Membros
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {totalMembros}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Media Presenca
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${getPercentageColor(
                    estatisticas.taxaPresenca
                  )}`}
                >
                  {estatisticas.taxaPresenca}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Pontualidade
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${getPercentageColor(
                    estatisticas.taxaPontualidade
                  )}`}
                >
                  {estatisticas.taxaPontualidade}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Encontros</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">
                  {estatisticas.totalEncontros}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Breakdown */}
      {classeBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Membros por Classe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {classeBreakdown.map((c) => {
                const totalDesbravadores = classeBreakdown.reduce(
                  (acc, cls) => acc + cls.quantidade,
                  0
                );
                return (
                  <div key={c.classeNome} className="flex items-center gap-3">
                    <span className="text-sm w-28 text-gray-700">
                      {c.classeNome}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${
                            totalDesbravadores > 0
                              ? (c.quantidade / totalDesbravadores) * 100
                              : 0
                          }%`,
                          backgroundColor: "var(--unit-primary)",
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {c.quantidade}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members Preview (first 5) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Membros</CardTitle>
          <Link href="/conselheiro/minha-unidade/membros">
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {primeiros5Membros.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Nenhum membro encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {primeiros5Membros.map((membro) => (
                <div
                  key={membro.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: "var(--unit-primary)" }}
                    >
                      {membro.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{membro.nome}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {membro.tipo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {membro.classe && (
                      <Badge variant="outline" className="text-xs">
                        {membro.classe.nome}
                      </Badge>
                    )}
                    <Badge
                      variant={membro.ativo ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {membro.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href="/conselheiro/minha-unidade/membros">
          <Button>Ver Membros</Button>
        </Link>
        <Link href="/conselheiro/minha-unidade/historico">
          <Button variant="outline">Ver Historico</Button>
        </Link>
      </div>
    </div>
  );
}
