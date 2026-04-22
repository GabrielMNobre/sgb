import Link from "next/link";
import { Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCampeonatoAtivo, getDashboardExecutivo, getRankingCompleto } from "@/services/campeonato";

export async function AdminCampeonatoCard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const campeonato = await getCampeonatoAtivo();
  if (!campeonato) return null;

  let dash;
  let top5: { nome: string; pontos: number }[] = [];
  try {
    [dash] = await Promise.all([
      getDashboardExecutivo(campeonato.id),
    ]);
    const ranking = await getRankingCompleto(campeonato.id);
    top5 = ranking
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
      .map((r) => ({ nome: r.unidadeNome, pontos: r.total }));
  } catch (err) {
    console.error("[AdminCampeonatoCard] erro:", err);
    return null;
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Campeonato 2026
      </h2>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Status do Campeonato
            </CardTitle>
            <Link href="/admin/campeonato">
              <Button variant="ghost" size="sm">
                Ver detalhes
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Avaliações</p>
              <p className="text-2xl font-bold text-blue-600">{dash.totalAvaliacoes}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Deméritos</p>
              <p className="text-2xl font-bold text-red-600">{dash.totalDemeritos}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Unidades</p>
              <p className="text-2xl font-bold text-green-600">{dash.unidadesParticipantes}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Dias</p>
              <p className="text-2xl font-bold text-amber-600">
                {dash.diasCampanha}
                <span className="text-sm font-normal text-gray-400">/292</span>
              </p>
            </div>
          </div>
          {top5.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ranking</p>
              {top5.map((u, i) => (
                <div key={u.nome} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400 w-5">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{u.nome}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-sm font-bold text-gray-700">
                      {u.pontos.toLocaleString("pt-BR")} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
