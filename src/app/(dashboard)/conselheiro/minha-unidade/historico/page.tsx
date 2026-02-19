"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import { PRESENCE_LABELS } from "@/lib/constants";
import type { HistoricoPresencasResult } from "@/services/conselheiro-dashboard";

function statusVariant(
  status: string
): "success" | "warning" | "error" | "secondary" {
  switch (status) {
    case "pontual":
      return "success";
    case "atrasado":
      return "warning";
    case "falta":
      return "error";
    case "falta_justificada":
      return "secondary";
    default:
      return "secondary";
  }
}

function presencaBadgeVariant(
  percentual: number
): "success" | "warning" | "error" {
  if (percentual >= 80) return "success";
  if (percentual >= 50) return "warning";
  return "error";
}

export default function HistoricoPage() {
  const [periodo, setPeriodo] = useState<string>("3m");
  const [visao, setVisao] = useState<"encontros" | "membros">("encontros");
  const [data, setData] = useState<HistoricoPresencasResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/conselheiro/historico?periodo=${periodo}`
      );
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    setExpandedItems(new Set());
  }, [visao]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Histórico de Presenças
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Acompanhamento de presenças da unidade
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="30d">Últimos 30 dias</option>
          <option value="3m">3 meses</option>
          <option value="6m">6 meses</option>
          <option value="1a">1 ano</option>
        </select>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              visao === "encontros"
                ? "bg-white shadow-sm font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setVisao("encontros")}
          >
            Por Encontro
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              visao === "membros"
                ? "bg-white shadow-sm font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setVisao("membros")}
          >
            Por Membro
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs sm:text-sm text-gray-500">
                Total Encontros
              </p>
              <p className="text-xl sm:text-2xl font-bold">
                {data.resumo.totalEncontros}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs sm:text-sm text-gray-500">
                Média Presença
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {data.resumo.mediaPresenca}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs sm:text-sm text-gray-500">
                Média Pontualidade
              </p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {data.resumo.mediaPontualidade}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <p className="text-xs sm:text-sm text-gray-500">
                  +Presente
                </p>
              </div>
              <p className="text-sm sm:text-base font-bold truncate">
                {data.resumo.membroMaisPresente || "\u2014"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                <p className="text-xs sm:text-sm text-gray-500">
                  +Faltas
                </p>
              </div>
              <p className="text-sm sm:text-base font-bold truncate">
                {data.resumo.membroMaisFaltas || "\u2014"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center py-12">
              <Loading size="lg" />
              <p className="text-gray-500 mt-3">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      ) : !data ||
        (visao === "encontros" && data.encontros.length === 0) ||
        (visao === "membros" && data.membros.length === 0) ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhum registro encontrado</p>
            </div>
          </CardContent>
        </Card>
      ) : visao === "encontros" ? (
        <div className="space-y-3">
          {data.encontros.map((e) => (
            <Card key={e.encontroId} className="overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => toggleExpand(e.encontroId)}
              >
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">
                        {formatDate(e.data)}
                      </span>
                      {e.descricao && (
                        <span className="text-sm text-gray-500 truncate hidden sm:inline">
                          {e.descricao}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm">
                        {e.presentes}/{e.presentes + e.faltas}
                      </span>
                      <Badge
                        variant={presencaBadgeVariant(e.percentualPresenca)}
                      >
                        {e.percentualPresenca}%
                      </Badge>
                      {expandedItems.has(e.encontroId) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </button>
              {expandedItems.has(e.encontroId) && (
                <div className="border-t bg-gray-50 px-4 py-3">
                  <div className="space-y-1">
                    {e.detalhes.map((d) => (
                      <div
                        key={d.membroId}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span>{d.membroNome}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={statusVariant(d.status)}
                            className="text-xs"
                          >
                            {PRESENCE_LABELS[d.status] || d.status}
                          </Badge>
                          {d.temMaterial && (
                            <span className="text-green-600 text-xs">
                              Material
                            </span>
                          )}
                          {d.temUniforme && (
                            <span className="text-blue-600 text-xs">
                              Uniforme
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data.membros.map((m) => (
            <Card key={m.membroId} className="overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => toggleExpand(m.membroId)}
              >
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{m.membroNome}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {m.totalPresencas}P / {m.totalFaltas}F
                      </span>
                      <Badge
                        variant={presencaBadgeVariant(
                          m.percentualPresenca
                        )}
                      >
                        {m.percentualPresenca}%
                      </Badge>
                      {expandedItems.has(m.membroId) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </button>
              {expandedItems.has(m.membroId) && (
                <div className="border-t bg-gray-50 px-4 py-3">
                  <div className="space-y-1">
                    {m.historico.map((h) => (
                      <div
                        key={h.encontroId}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className="text-gray-600">
                          {formatDate(h.data)}
                        </span>
                        <Badge
                          variant={statusVariant(h.status)}
                          className="text-xs"
                        >
                          {h.status === "sem_registro"
                            ? "Sem Registro"
                            : PRESENCE_LABELS[h.status] || h.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
