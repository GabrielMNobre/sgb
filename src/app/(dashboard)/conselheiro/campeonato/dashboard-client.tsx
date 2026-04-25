"use client";

import type {
  DashboardConselheiro,
  AvaliacaoCampeonato,
} from "@/types/campeonato";
import type { DetalhesDia } from "@/services/campeonato";
import {
  DEMERITOS_CONFIG,
  NIVEL_CORES,
  CATEGORIAS_LABELS,
} from "@/types/campeonato";
import {
  Trophy,
  Calendar,
  ClipboardList,
  Gamepad2,
  Star,
  ShieldAlert,
} from "lucide-react";

interface Props {
  dashboard: DashboardConselheiro;
  detalhesEncontro: DetalhesDia | null;
  encontroData: string | null;
}

const COR_AVALIACAO: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  verde: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  amarelo: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  vermelho: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

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

function formatarDataCompleta(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

function getNivelDemerito(tipo: string): string {
  return tipo.split("_")[0].toUpperCase();
}

function getLabelDemerito(tipo: string): string {
  const config = DEMERITOS_CONFIG.find((d) => d.value === (tipo as any));
  return config?.label || tipo;
}

function extrairNomeDinamica(descricao?: string): string {
  if (!descricao) return "Dinâmica";
  const match = descricao.match(/^Dinâmica: (.+?) - /);
  return match ? match[1] : "Dinâmica";
}

function extrairColocacaoDinamica(descricao?: string): string {
  if (!descricao) return "";
  const match = descricao.match(/Colocação: (.+)$/);
  if (match) return match[1];
  if (descricao.includes("Participou")) return "Participou";
  return "";
}

function agruparAvaliacoes(avaliacoes: AvaliacaoCampeonato[]) {
  const chamada: AvaliacaoCampeonato[] = [];
  const dinamicas: AvaliacaoCampeonato[] = [];
  const extras: AvaliacaoCampeonato[] = [];

  for (const av of avaliacoes) {
    if (TIPOS_CHAMADA.has(av.tipoAvaliacao)) {
      chamada.push(av);
    } else if (av.tipoAvaliacao === "dinamicas") {
      dinamicas.push(av);
    } else {
      extras.push(av);
    }
  }

  return { chamada, dinamicas, extras };
}

function AvaliacaoItem({
  av,
  label,
}: {
  av: AvaliacaoCampeonato;
  label: string;
}) {
  const cores = COR_AVALIACAO[av.cor] || COR_AVALIACAO.vermelho;
  return (
    <div
      className={`flex items-start sm:items-center justify-between gap-2 px-3 py-2.5 rounded-lg border ${cores.bg} ${cores.border}`}
    >
      <span className={`text-sm leading-tight ${cores.text} min-w-0`}>
        {label}
      </span>
      <span
        className={`text-sm font-bold ${cores.text} shrink-0`}
      >
        +{av.pontos}
      </span>
    </div>
  );
}

function SubtotalRow({
  label,
  pontos,
  tipo,
}: {
  label: string;
  pontos: number;
  tipo: "positivo" | "negativo";
}) {
  return (
    <div
      className={`flex justify-between px-3 py-1.5 text-sm font-semibold ${
        tipo === "positivo" ? "text-green-700" : "text-red-700"
      }`}
    >
      <span>{label}</span>
      <span>
        {tipo === "positivo" ? "+" : "-"}
        {pontos} pts
      </span>
    </div>
  );
}

export function DashboardConselheiroClient({
  dashboard,
  detalhesEncontro,
  encontroData,
}: Props) {
  const encontroFormatado = encontroData
    ? formatarDataCompleta(encontroData)
    : null;

  const temAtividade =
    detalhesEncontro !== null &&
    (detalhesEncontro.avaliacoes.length > 0 ||
      detalhesEncontro.demeritos.length > 0);

  const { chamada, dinamicas, extras } = detalhesEncontro
    ? agruparAvaliacoes(detalhesEncontro.avaliacoes)
    : { chamada: [], dinamicas: [], extras: [] };

  const pontosChamada = chamada.reduce((s, a) => s + a.pontos, 0);
  const pontosDinamicas = dinamicas.reduce((s, a) => s + a.pontos, 0);
  const pontosExtras = extras.reduce((s, a) => s + a.pontos, 0);
  const totalPontosEncontro = pontosChamada + pontosDinamicas + pontosExtras;
  const totalDemeritosEncontro = detalhesEncontro
    ? detalhesEncontro.demeritos.reduce(
        (s, d) => s + Math.abs(d.pontosPerdidos),
        0
      )
    : 0;
  const saldoEncontro = totalPontosEncontro - totalDemeritosEncontro;

  const dinamicasPorNome: Record<string, AvaliacaoCampeonato[]> = {};
  for (const d of dinamicas) {
    const nome = extrairNomeDinamica(d.descricao);
    if (!dinamicasPorNome[nome]) dinamicasPorNome[nome] = [];
    dinamicasPorNome[nome].push(d);
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header - Identidade da Unidade */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-8 sm:w-4 sm:h-10 rounded shrink-0"
              style={{ backgroundColor: dashboard.unidadeCor }}
            />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Sua Unidade
              </p>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {dashboard.unidadeNome}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 sm:px-4 py-2 self-start">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Total Acumulado
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {dashboard.totalPontos.toLocaleString("pt-BR")}
                <span className="text-xs sm:text-sm font-normal ml-1">
                  pts
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Encontro */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <div className="flex items-start gap-2 mb-4">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-gray-700 leading-tight">
              {encontroFormatado
                ? "Encontro em Andamento"
                : "Nenhum encontro em andamento"}
            </h2>
            {encontroFormatado && (
              <p className="text-xs text-gray-400 mt-0.5">
                {encontroFormatado}
              </p>
            )}
          </div>
        </div>

        {!temAtividade ? (
          <p className="text-gray-400 text-sm italic">
            {encontroData
              ? "Nenhuma pontuação registrada neste encontro ainda."
              : "Aguardando o administrador iniciar um encontro."}
          </p>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {/* Chamada */}
            {chamada.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                  <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Chamada
                  </p>
                </div>
                <div className="space-y-1.5">
                  {chamada.map((av) => (
                    <AvaliacaoItem
                      key={av.id}
                      av={av}
                      label={
                        LABELS_CHAMADA[av.tipoAvaliacao] || av.tipoAvaliacao
                      }
                    />
                  ))}
                  <SubtotalRow
                    label="Subtotal Chamada"
                    pontos={pontosChamada}
                    tipo="positivo"
                  />
                </div>
              </div>
            )}

            {/* Dinâmicas */}
            {dinamicas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                  <p className="text-[10px] sm:text-xs font-semibold text-purple-600 uppercase tracking-wide">
                    Dinâmicas
                  </p>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(dinamicasPorNome).map(([nome, avs]) => {
                    const av = avs[0];
                    const colocacao = extrairColocacaoDinamica(av.descricao);
                    const labelDin = colocacao
                      ? `${nome} — ${colocacao}`
                      : nome;
                    return (
                      <AvaliacaoItem key={av.id} av={av} label={labelDin} />
                    );
                  })}
                  <SubtotalRow
                    label="Subtotal Dinâmicas"
                    pontos={pontosDinamicas}
                    tipo="positivo"
                  />
                </div>
              </div>
            )}

            {/* Avaliações Extras */}
            {extras.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                  <p className="text-[10px] sm:text-xs font-semibold text-amber-600 uppercase tracking-wide">
                    Avaliações Extras
                  </p>
                </div>
                <div className="space-y-1.5">
                  {extras.map((av) => {
                    let label: string;
                    if (av.tipoAvaliacao === "mensalidade") {
                      label = "Mensalidade";
                    } else {
                      const categoriaLabel =
                        CATEGORIAS_LABELS[av.categoria] || av.categoria;
                      const tipoLabel = av.tipoAvaliacao.replace(/_/g, " ");
                      label = `${categoriaLabel} — ${tipoLabel}`;
                    }
                    return (
                      <AvaliacaoItem key={av.id} av={av} label={label} />
                    );
                  })}
                  <SubtotalRow
                    label="Subtotal Extras"
                    pontos={pontosExtras}
                    tipo="positivo"
                  />
                </div>
              </div>
            )}

            {/* Deméritos */}
            {detalhesEncontro!.demeritos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                  <p className="text-[10px] sm:text-xs font-semibold text-red-600 uppercase tracking-wide">
                    Deméritos
                  </p>
                </div>
                <div className="space-y-1.5">
                  {detalhesEncontro!.demeritos.map((dem) => {
                    const nivel = getNivelDemerito(dem.tipoDemeritos);
                    const cor = NIVEL_CORES[nivel] || "#DC3545";
                    return (
                      <div
                        key={dem.id}
                        className="flex items-start sm:items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-red-100 bg-red-50"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded text-white shrink-0"
                            style={{ backgroundColor: cor }}
                          >
                            {nivel}
                          </span>
                          <span className="text-sm text-red-700 leading-tight">
                            {getLabelDemerito(dem.tipoDemeritos)}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-red-700 shrink-0">
                          {dem.pontosPerdidos}
                        </span>
                      </div>
                    );
                  })}
                  <SubtotalRow
                    label="Subtotal Deméritos"
                    pontos={totalDemeritosEncontro}
                    tipo="negativo"
                  />
                </div>
              </div>
            )}

            {/* Total do Encontro */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-bold text-gray-700">
                  Total do Encontro
                </span>
                <span
                  className={`text-base sm:text-lg font-bold ${
                    saldoEncontro >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {saldoEncontro >= 0 ? "+" : ""}
                  {saldoEncontro} pts
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
