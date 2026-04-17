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
  CategoriaCampeonato,
} from "@/types/campeonato";
import type { EvolucaoMensal } from "@/services/campeonato";
import {
  DEMERITOS_CONFIG,
  NIVEL_CORES,
  TIPOS_POR_CATEGORIA,
} from "@/types/campeonato";
import {
  Trophy,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Gamepad2,
  Star,
  ShieldAlert,
  History,
  Calendar,
} from "lucide-react";

interface Props {
  dashboard: DashboardConselheiro;
  historico: HistoricoItem[];
  metas: MetaCampeonato[];
  evolucao: EvolucaoMensal[];
}

const TIPOS_CHAMADA = new Set([
  "presenca",
  "pontualidade",
  "materiais",
  "uniforme",
]);

const LABELS_CHAMADA: Record<string, string> = {
  presenca: "Presença",
  pontualidade: "Pontualidade",
  materiais: "Materiais",
  uniforme: "Uniforme",
};

interface DiaAgrupado {
  data: string;
  dataFormatada: string;
  itens: HistoricoItem[];
  totalPontos: number;
  totalDemeritos: number;
  saldo: number;
  qtdAvaliacoes: number;
  qtdDemeritos: number;
}

function formatarDataCompleta(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split("-");
  const d = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return `${diasSemana[d.getDay()]}, ${dia}/${mes}/${ano}`;
}

function getLabelTipoAvaliacao(tipo: string, categoria?: string): string {
  if (LABELS_CHAMADA[tipo]) return LABELS_CHAMADA[tipo];
  if (tipo === "dinamicas") return "Dinâmica";
  if (tipo === "mensalidade") return "Mensalidade";
  if (categoria) {
    const tipos = TIPOS_POR_CATEGORIA[categoria as CategoriaCampeonato];
    if (tipos) {
      const found = tipos.find((t) => t.value === tipo);
      if (found) return found.label;
    }
  }
  return tipo.replace(/_/g, " ");
}

function getLabelDemerito(tipo: string): string {
  const config = DEMERITOS_CONFIG.find((d) => d.value === (tipo as any));
  return config?.label || tipo.replace(/_/g, " ");
}

function getNivelDemerito(tipo: string): string {
  return tipo.split("_")[0].toUpperCase();
}

function getOrigemIcon(item: HistoricoItem) {
  if (item.tipoRegistro === "demeritos") {
    return { icon: ShieldAlert, cor: "text-red-500" };
  }
  const tipo = item.tipoAvaliacao || item.tipo;
  if (TIPOS_CHAMADA.has(tipo)) return { icon: ClipboardList, cor: "text-blue-500" };
  if (tipo === "dinamicas") return { icon: Gamepad2, cor: "text-purple-500" };
  return { icon: Star, cor: "text-amber-500" };
}

function getOrigemLabel(item: HistoricoItem): string {
  if (item.tipoRegistro === "demeritos") return "Demérito";
  const tipo = item.tipoAvaliacao || item.tipo;
  if (TIPOS_CHAMADA.has(tipo)) return "Chamada";
  if (tipo === "dinamicas") return "Dinâmica";
  return "Avaliação";
}

function extrairNomeDinamica(descricao?: string): string | null {
  if (!descricao) return null;
  const match = descricao.match(/^Dinâmica: (.+?) - /);
  return match ? match[1] : null;
}

function agruparPorDia(historico: HistoricoItem[]): DiaAgrupado[] {
  const grupos: Record<string, HistoricoItem[]> = {};

  for (const item of historico) {
    const data = item.dataRegistro;
    if (!grupos[data]) grupos[data] = [];
    grupos[data].push(item);
  }

  return Object.entries(grupos)
    .map(([data, itens]) => {
      const totalPontos = itens
        .filter((i) => i.tipoRegistro === "avaliacao")
        .reduce((s, i) => s + i.pontosGanhos, 0);
      const totalDemeritos = itens
        .filter((i) => i.tipoRegistro === "demeritos")
        .reduce((s, i) => s + i.pontosPerdidos, 0);

      return {
        data,
        dataFormatada: formatarDataCompleta(data),
        itens,
        totalPontos,
        totalDemeritos,
        saldo: totalPontos - totalDemeritos,
        qtdAvaliacoes: itens.filter((i) => i.tipoRegistro === "avaliacao").length,
        qtdDemeritos: itens.filter((i) => i.tipoRegistro === "demeritos").length,
      };
    })
    .sort((a, b) => b.data.localeCompare(a.data));
}

function DiaCard({ dia }: { dia: DiaAgrupado }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header do dia - clicável */}
      <button
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        onClick={() => setExpandido(!expandido)}
      >
        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />

        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-gray-900">
            {dia.dataFormatada}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {dia.qtdAvaliacoes > 0 && (
              <span className="text-green-600">
                {dia.qtdAvaliacoes} {dia.qtdAvaliacoes === 1 ? "avaliação" : "avaliações"}
              </span>
            )}
            {dia.qtdAvaliacoes > 0 && dia.qtdDemeritos > 0 && (
              <span className="text-gray-300"> · </span>
            )}
            {dia.qtdDemeritos > 0 && (
              <span className="text-red-500">
                {dia.qtdDemeritos} {dia.qtdDemeritos === 1 ? "demérito" : "deméritos"}
              </span>
            )}
          </p>
        </div>

        {/* Saldo */}
        <span
          className={`text-base font-bold shrink-0 ${
            dia.saldo >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {dia.saldo >= 0 ? "+" : ""}
          {dia.saldo} pts
        </span>

        {expandido ? (
          <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        )}
      </button>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-gray-100 pt-3">
          {dia.itens.map((item, idx) => {
            const { icon: Icon, cor: iconCor } = getOrigemIcon(item);
            const isDemerito = item.tipoRegistro === "demeritos";
            const nivel = isDemerito ? getNivelDemerito(item.tipo) : null;
            const nivelCor = nivel ? NIVEL_CORES[nivel] : null;

            let detalhe = "";
            if (isDemerito) {
              detalhe = getLabelDemerito(item.tipo);
            } else if ((item.tipoAvaliacao || item.tipo) === "dinamicas") {
              detalhe = extrairNomeDinamica(item.descricao) || "Dinâmica";
            } else {
              detalhe = getLabelTipoAvaliacao(
                item.tipoAvaliacao || item.tipo,
                item.categoria
              );
            }

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${
                  isDemerito
                    ? "bg-red-50 border-red-100"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${iconCor}`} />

                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-800">{detalhe}</span>
                  {nivel && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: nivelCor || "#DC3545" }}
                    >
                      {nivel}
                    </span>
                  )}
                  {item.cor && !isDemerito && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.cor === "verde"
                          ? "bg-green-100 text-green-700"
                          : item.cor === "amarelo"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.cor === "verde"
                        ? "Verde"
                        : item.cor === "amarelo"
                        ? "Amarelo"
                        : "Vermelho"}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {getOrigemLabel(item)}
                  </span>
                </div>

                <span
                  className={`text-sm font-bold shrink-0 ${
                    isDemerito ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {isDemerito ? "-" : "+"}
                  {isDemerito ? item.pontosPerdidos : item.pontosGanhos}
                </span>
              </div>
            );
          })}

          {/* Resumo do dia */}
          <div className="flex items-center justify-between px-3 pt-2 border-t border-gray-100 mt-2">
            <div className="flex gap-4 text-xs">
              {dia.totalPontos > 0 && (
                <span className="text-green-600 font-medium">
                  +{dia.totalPontos} pts
                </span>
              )}
              {dia.totalDemeritos > 0 && (
                <span className="text-red-600 font-medium">
                  -{dia.totalDemeritos} pts
                </span>
              )}
            </div>
            <span
              className={`text-sm font-bold ${
                dia.saldo >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              Saldo: {dia.saldo >= 0 ? "+" : ""}
              {dia.saldo} pts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoricoClient({
  dashboard,
  historico,
  metas,
  evolucao,
}: Props) {
  const diasAgrupados = agruparPorDia(historico);

  const totalGeral = diasAgrupados.reduce((s, d) => s + d.saldo, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-10 rounded"
              style={{ backgroundColor: dashboard.unidadeCor }}
            />
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Histórico — {dashboard.unidadeNome}
              </p>
              <h1 className="text-xl font-bold text-gray-900">
                Campeonato 2026
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

      {/* Gráfico de Evolução */}
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
                formatter={(value: any) => [
                  `${Number(value).toLocaleString("pt-BR")} pts`,
                  "Acumulado",
                ]}
                labelFormatter={(label: any) => `Mês: ${label}`}
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

      {/* Metas */}
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

      {/* Pontuações por Encontro */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-700">
              Pontuações por Encontro
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {diasAgrupados.length} {diasAgrupados.length === 1 ? "encontro" : "encontros"}
            </span>
          </div>
          {totalGeral !== 0 && (
            <span
              className={`text-sm font-bold ${
                totalGeral >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              Total: {totalGeral >= 0 ? "+" : ""}
              {totalGeral} pts
            </span>
          )}
        </div>

        {diasAgrupados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <History className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Nenhuma pontuação registrada ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {diasAgrupados.map((dia) => (
              <DiaCard key={dia.data} dia={dia} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaCard({ meta }: { meta: MetaCampeonato }) {
  const statusConfig = {
    concluido: {
      label: "Concluído",
      cls: "bg-green-50 border-green-200 text-green-700",
    },
    disponivel: {
      label: "Disponível",
      cls: "bg-blue-50 border-blue-200 text-blue-700",
    },
    vencido: {
      label: "Vencido",
      cls: "bg-red-50 border-red-200 text-red-700",
    },
    em_progresso: {
      label: "Em Progresso",
      cls: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
    em_dia: {
      label: "Em Dia",
      cls: "bg-green-50 border-green-200 text-green-700",
    },
    com_atraso: {
      label: "Com Atraso",
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
              {Math.round(
                (meta.progresso.atual / meta.progresso.maximo) * 100
              )}
              %
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
