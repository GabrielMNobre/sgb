"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type {
  DashboardExecutivo,
  AtividadeItem,
  StatusClasseItem,
  Campeonato,
} from "@/types/campeonato";
import { ClipboardList, AlertTriangle, Building2, Calendar, Trophy, Play, CheckCircle, XCircle } from "lucide-react";

interface Props {
  dashboard: DashboardExecutivo;
  atividade: AtividadeItem[];
  statusClasses: StatusClasseItem[];
  campeonato: Campeonato;
}

function formatarData(dataStr: string): string {
  const [, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}`;
}

const STATUS_LABELS: Record<string, string> = {
  regular: "Classe Regular",
  avancada: "Classe Avançada",
  biblica: "Classe Bíblica",
};

const STATUS_DEADLINES: Record<string, string> = {
  regular: "até 28/06",
  avancada: "até 25/10",
  biblica: "Contínuo",
};

export function DashboardExecutivoClient({
  dashboard,
  atividade,
  statusClasses,
}: Props) {
  const [inicializando, setInicializando] = useState(false);
  const [feedbackInit, setFeedbackInit] = useState<{
    tipo: "sucesso" | "erro";
    msg: string;
  } | null>(null);

  async function handleInicializar() {
    if (
      !confirm(
        "Isso criará registros de ranking e classes para todas as unidades ativas que ainda não foram inicializadas. Continuar?"
      )
    )
      return;

    setInicializando(true);
    setFeedbackInit(null);
    try {
      const res = await fetch("/api/admin/campeonato/inicializar", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        setFeedbackInit({ tipo: "erro", msg: json.error || "Erro ao inicializar" });
      } else {
        const { unidadesProcessadas, rankingCriados, classesCriadas, erros } = json;
        if (erros?.length) {
          setFeedbackInit({ tipo: "erro", msg: erros.join("; ") });
        } else {
          setFeedbackInit({
            tipo: "sucesso",
            msg: `${unidadesProcessadas} unidades processadas — ${rankingCriados} rankings e ${classesCriadas} registros de classes criados.`,
          });
        }
      }
    } catch {
      setFeedbackInit({ tipo: "erro", msg: "Erro ao inicializar campeonato" });
    } finally {
      setInicializando(false);
    }
  }

  const kpis = [
    {
      label: "Total Avaliações",
      valor: dashboard.totalAvaliacoes,
      icon: ClipboardList,
      cor: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Deméritos Registrados",
      valor: dashboard.totalDemeritos,
      icon: AlertTriangle,
      cor: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Unidades Participantes",
      valor: dashboard.unidadesParticipantes,
      icon: Building2,
      cor: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Dias de Campanha",
      valor: `${dashboard.diasCampanha}/292`,
      icon: Calendar,
      cor: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Dashboard Executivo — Campeonato 2026
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Período: 01/02/2026 a 30/11/2026
          </p>
        </div>
        <button
          onClick={handleInicializar}
          disabled={inicializando}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Play className="h-4 w-4" />
          {inicializando ? "Inicializando..." : "Inicializar Campeonato"}
        </button>
      </div>

      {/* Feedback inicialização */}
      {feedbackInit && (
        <div
          className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            feedbackInit.tipo === "sucesso"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedbackInit.tipo === "sucesso" ? (
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          {feedbackInit.msg}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className={`w-8 h-8 ${kpi.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`h-4 w-4 ${kpi.cor}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.valor}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Unidades */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-base font-semibold text-gray-700">
              Top 5 Unidades
            </h2>
          </div>
          <div className="space-y-3">
            {dashboard.top5.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Nenhuma unidade no ranking ainda.
              </p>
            ) : (
              dashboard.top5.map((u, i) => {
                const badges = ["🥇", "🥈", "🥉", "", ""];
                const maxPontos = dashboard.top5[0]?.pontos || 1;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg w-6 text-center">
                          {badges[i] || `${i + 1}º`}
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {u.nome}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {u.pontos.toLocaleString("pt-BR")} pts
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full ml-8 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{
                          width: `${Math.round((u.pontos / maxPontos) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status das Classes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Status das Classes
          </h2>
          <div className="space-y-4">
            {statusClasses.map((sc) => (
              <div key={sc.tipo}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {STATUS_LABELS[sc.tipo]}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {STATUS_DEADLINES[sc.tipo]}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    ✅ {sc.concluidas}/{sc.total} ({sc.percentual}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all"
                    style={{ width: `${sc.percentual}%` }}
                  />
                </div>
              </div>
            ))}
            {statusClasses.length === 0 && (
              <p className="text-sm text-gray-400 italic">
                Sem dados de classes ainda.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de Atividade */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Atividade — Últimos 30 Dias
        </h2>
        {atividade.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Nenhuma atividade registrada.
          </p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={atividade}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="data"
                  tickFormatter={formatarData}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip
                  labelFormatter={(label) => formatarData(label as string)}
                  formatter={(value, name) => [
                    value,
                    name === "numAvaliacoes" ? "Avaliações" : "Deméritos",
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === "numAvaliacoes" ? "Avaliações" : "Deméritos"
                  }
                />
                <Bar dataKey="numAvaliacoes" fill="#1a2b5f" radius={[2, 2, 0, 0]} />
                <Bar dataKey="totalDemeritos" fill="#DC3545" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
