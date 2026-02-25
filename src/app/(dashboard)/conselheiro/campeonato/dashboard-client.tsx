"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  DashboardConselheiro,
  HistoricoItem,
  MetaCampeonato,
} from "@/types/campeonato";
import type { DetalhesDia, EvolucaoMensal } from "@/services/campeonato";
import {
  CATEGORIAS_LABELS,
  CATEGORIAS_CORES,
  DEMERITOS_CONFIG,
  NIVEL_CORES,
} from "@/types/campeonato";
import { Trophy, TrendingUp, AlertTriangle, Calendar, Target, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  dashboard: DashboardConselheiro;
  detalhesHoje: DetalhesDia;
  historico: HistoricoItem[];
  metas: MetaCampeonato[];
  evolucao: EvolucaoMensal[];
  hoje: string;
}

const COR_AVALIACAO: Record<string, { bg: string; text: string; border: string }> = {
  verde: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  amarelo: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  vermelho: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

function formatarData(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

function getNivelDemerito(tipo: string): string {
  return tipo.split("_")[0].toUpperCase();
}

function getLabelDemerito(tipo: string): string {
  const config = DEMERITOS_CONFIG.find((d) => d.value === tipo as any);
  return config?.label || tipo;
}

export function DashboardConselheiroClient({
  dashboard,
  detalhesHoje,
  historico,
  metas,
  evolucao,
  hoje,
}: Props) {
  const [mostrarHistorico, setMostrarHistorico] = useState(true);

  const hojeFormatado = formatarData(hoje);
  const totalAvaliacoesDia = detalhesHoje.avaliacoes.length;
  const totalDemeritosDia = detalhesHoje.demeritos.length;
  const temAtividadeHoje = totalAvaliacoesDia > 0 || totalDemeritosDia > 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header - Identidade da Unidade */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-10 rounded"
              style={{ backgroundColor: dashboard.unidadeCor }}
            />
            <div>
              <p className="text-sm text-gray-500 font-medium">Sua Unidade</p>
              <h1 className="text-xl font-bold text-gray-900">
                {dashboard.unidadeNome}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-4 py-2">
            <Trophy className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-gray-500">Total Acumulado</p>
              <p className="text-2xl font-bold text-primary">
                {dashboard.totalPontos.toLocaleString("pt-BR")}
                <span className="text-sm font-normal ml-1">pts</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção HOJE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-700">
            Hoje — {hojeFormatado}
          </h2>
        </div>

        {!temAtividadeHoje ? (
          <p className="text-gray-400 text-sm italic">
            Nenhum registro para hoje ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Pontos do dia */}
            {detalhesHoje.avaliacoes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                  ✅ Pontos do Dia
                </p>
                <div className="space-y-1.5">
                  {detalhesHoje.avaliacoes.map((av) => {
                    const cores = COR_AVALIACAO[av.cor] || COR_AVALIACAO.vermelho;
                    const categoriaLabel =
                      CATEGORIAS_LABELS[av.categoria] || av.categoria;
                    return (
                      <div
                        key={av.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cores.bg} ${cores.border}`}
                      >
                        <span className={`text-sm ${cores.text}`}>
                          {categoriaLabel} — {av.tipoAvaliacao.replace(/_/g, " ")}
                        </span>
                        <span className={`text-sm font-bold ${cores.text}`}>
                          +{av.pontos} pts
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between px-3 py-1.5 text-sm font-semibold text-green-700">
                    <span>Subtotal</span>
                    <span>+{dashboard.pontosDia} pts</span>
                  </div>
                </div>
              </div>
            )}

            {/* Deméritos do dia */}
            {detalhesHoje.demeritos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                  ⚠️ Deméritos do Dia
                </p>
                <div className="space-y-1.5">
                  {detalhesHoje.demeritos.map((dem) => {
                    const nivel = getNivelDemerito(dem.tipoDemeritos);
                    const cor = NIVEL_CORES[nivel] || "#DC3545";
                    return (
                      <div
                        key={dem.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg border border-red-100 bg-red-50"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: cor }}
                          >
                            {nivel}
                          </span>
                          <span className="text-sm text-red-700">
                            ❌ {getLabelDemerito(dem.tipoDemeritos)}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-red-700">
                          {dem.pontos} pts
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between px-3 py-1.5 text-sm font-semibold text-red-700">
                    <span>Subtotal</span>
                    <span>-{dashboard.demeritosDia} pts</span>
                  </div>
                </div>
              </div>
            )}

            {/* Total do dia */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-bold text-gray-700">
                  💰 Total do Dia
                </span>
                <span
                  className={`text-base font-bold ${
                    dashboard.saldoDia >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {dashboard.saldoDia >= 0 ? "+" : ""}
                  {dashboard.saldoDia} pts
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico de Evolução Anual */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-gray-700">
            Evolução Anual 2026
          </h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="nomeMes"
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString("pt-BR")} pts`,
                  "Acumulado",
                ]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="acumulado"
                stroke="#1a2b5f"
                strokeWidth={2}
                dot={{ fill: "#1a2b5f", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Próximas Metas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-gray-700">
            Metas do Campeonato
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {metas.map((meta) => (
            <MetaCard key={meta.nome} meta={meta} />
          ))}
        </div>
      </div>

      {/* Histórico 30 dias */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setMostrarHistorico(!mostrarHistorico)}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-700">
              Histórico — Últimos 30 Dias
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {historico.length}
            </span>
          </div>
          {mostrarHistorico ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {mostrarHistorico && (
          <div className="mt-4 overflow-x-auto">
            {historico.length === 0 ? (
              <p className="text-gray-400 text-sm italic">
                Nenhum registro nos últimos 30 dias.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">
                      Data
                    </th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                      Categoria
                    </th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">
                      Pontos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {historico.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 text-gray-600">
                        {formatarData(item.dataRegistro)}
                      </td>
                      <td className="py-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.tipoRegistro === "avaliacao"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {item.tipoRegistro === "avaliacao" ? "Avaliação" : "Demérito"}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500 hidden sm:table-cell">
                        {item.categoria
                          ? CATEGORIAS_LABELS[item.categoria as keyof typeof CATEGORIAS_LABELS] ||
                            item.categoria
                          : "—"}
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {item.tipoRegistro === "avaliacao" ? (
                          <span className="text-green-600">+{item.pontosGanhos}</span>
                        ) : (
                          <span className="text-red-600">-{item.pontosPerdidos}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaCard({ meta }: { meta: MetaCampeonato }) {
  const statusConfig = {
    concluido: {
      label: "Concluído ✅",
      cls: "bg-green-50 border-green-200 text-green-700",
    },
    disponivel: {
      label: "Disponível",
      cls: "bg-blue-50 border-blue-200 text-blue-700",
    },
    vencido: {
      label: "Vencido ❌",
      cls: "bg-red-50 border-red-200 text-red-700",
    },
    em_progresso: {
      label: "Em Progresso",
      cls: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
    em_dia: {
      label: "Em Dia ✅",
      cls: "bg-green-50 border-green-200 text-green-700",
    },
    com_atraso: {
      label: "Com Atraso ⚠️",
      cls: "bg-orange-50 border-orange-200 text-orange-700",
    },
  };

  const cfg = statusConfig[meta.status] || statusConfig.disponivel;

  return (
    <div className={`border rounded-lg p-4 ${cfg.cls}`}>
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-sm">{meta.nome}</h3>
        <span className="text-xs font-bold">{meta.pontos} pts</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium">{cfg.label}</span>
        {meta.prazo && (
          <span className="text-xs opacity-70">
            até {meta.prazo.split("-").reverse().join("/")}
          </span>
        )}
      </div>
      {meta.progresso && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>
              {meta.progresso.atual}/{meta.progresso.maximo}
            </span>
            <span>
              {Math.round((meta.progresso.atual / meta.progresso.maximo) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-current"
              style={{
                width: `${Math.min(
                  100,
                  (meta.progresso.atual / meta.progresso.maximo) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
