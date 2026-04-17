"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  CheckCircle,
  XCircle,
  Calculator,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResultadoMensalidade } from "@/services/campeonato";

const MESES_LABEL: Record<number, string> = {
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",
  10: "Outubro",
  11: "Novembro",
};

const COR_BADGE: Record<string, string> = {
  verde: "bg-green-100 text-green-700 border-green-200",
  amarelo: "bg-yellow-100 text-yellow-700 border-yellow-200",
  vermelho: "bg-red-100 text-red-700 border-red-200",
};

export default function MensalidadesCampeonatoPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano] = useState(2026);
  const [loading, setLoading] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [resultados, setResultados] = useState<ResultadoMensalidade[] | null>(
    null
  );
  const [stats, setStats] = useState<{
    registradas: number;
    ignoradas: number;
  } | null>(null);
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    msg: string;
  } | null>(null);

  async function handleCalcular() {
    setLoading(true);
    setFeedback(null);
    setResultados(null);
    setStats(null);

    try {
      const res = await fetch("/api/admin/campeonato/mensalidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mes, ano }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFeedback({
          tipo: "erro",
          msg: json.error || "Erro ao calcular pontuação",
        });
        return;
      }

      setResultados(json.unidades);
      setStats({ registradas: json.registradas, ignoradas: json.ignoradas });

      if (json.registradas > 0) {
        setFeedback({
          tipo: "sucesso",
          msg: `${json.registradas} pontuações registradas com sucesso!`,
        });
      } else if (json.ignoradas > 0) {
        setFeedback({
          tipo: "sucesso",
          msg: `Todas as ${json.ignoradas} unidades já tinham pontuação para ${MESES_LABEL[mes]}/${ano}.`,
        });
      }
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao calcular pontuação" });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemover() {
    if (
      !confirm(
        `Deseja remover todas as pontuações de mensalidade de ${MESES_LABEL[mes]}/${ano}?`
      )
    )
      return;

    setRemovendo(true);
    setFeedback(null);

    try {
      const res = await fetch(
        `/api/admin/campeonato/mensalidades?mes=${mes}&ano=${ano}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setFeedback({
          tipo: "sucesso",
          msg: `Pontuações de ${MESES_LABEL[mes]}/${ano} removidas.`,
        });
        setResultados(null);
        setStats(null);
      } else {
        const json = await res.json();
        setFeedback({
          tipo: "erro",
          msg: json.error || "Erro ao remover",
        });
      }
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao remover pontuação" });
    } finally {
      setRemovendo(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/campeonato">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Pontuação de Mensalidades
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Campeonato 2026 — Calcula pontos por adimplência mensal
          </p>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            feedback.tipo === "sucesso"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.tipo === "sucesso" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.msg}
        </div>
      )}

      {/* Regras */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-700 mb-2">
          Como funciona
        </h3>
        <div className="text-xs text-blue-600 space-y-1">
          <p>
            Calcula o percentual de adimplência (membros não-isentos com
            mensalidade paga) de cada unidade no mês selecionado.
          </p>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              100% = 50 pts
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              ≥70% = 30 pts
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              &lt;80% = 10 pts
            </span>
          </div>
        </div>
      </div>

      {/* Seleção de mês */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mês de referência
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={mes}
              onChange={(e) => {
                setMes(parseInt(e.target.value));
                setResultados(null);
                setStats(null);
                setFeedback(null);
              }}
            >
              {Object.entries(MESES_LABEL).map(([val, label]) => (
                <option key={val} value={val}>
                  {label} / {ano}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCalcular}
              disabled={loading || removendo}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <Calculator className="h-4 w-4" />
              {loading ? "Calculando..." : "Calcular e Registrar"}
            </button>
            <button
              onClick={handleRemover}
              disabled={loading || removendo}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {removendo ? "Removendo..." : "Remover"}
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {resultados && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold text-gray-700">
                Resultado — {MESES_LABEL[mes]} {ano}
              </h2>
            </div>
            {stats && (
              <div className="flex gap-3 text-xs">
                {stats.registradas > 0 && (
                  <span className="text-green-600 font-medium">
                    {stats.registradas} registradas
                  </span>
                )}
                {stats.ignoradas > 0 && (
                  <span className="text-gray-400">
                    {stats.ignoradas} já existiam
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {resultados.map((r) => (
              <div
                key={r.unidadeId}
                className="flex items-center gap-3 px-5 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {r.unidadeNome}
                    </span>
                    {r.jaRegistrado && (
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        já registrado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.pagos}/{r.totalMembros} pagos · {r.percentual}%
                    adimplência
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded border ${
                    COR_BADGE[r.cor]
                  }`}
                >
                  {r.cor === "verde"
                    ? "Verde"
                    : r.cor === "amarelo"
                    ? "Amarelo"
                    : "Vermelho"}
                </span>
                <span className="text-sm font-bold text-primary w-16 text-right">
                  +{r.pontos} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
