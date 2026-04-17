"use client";

import { useState, useEffect } from "react";
import type { RankingItem } from "@/types/campeonato";
import { CATEGORIAS_CORES } from "@/types/campeonato";
import { Search, RefreshCw, RotateCcw } from "lucide-react";

const COLUNAS = [
  { key: "compromisso" as const, label: "Chamada", cor: CATEGORIAS_CORES.compromisso },
  { key: "dinamicas" as const, label: "Dinâm.", cor: "#8B5CF6" },
  { key: "mensalidades" as const, label: "Mens.", cor: "#059669" },
  { key: "vidaUnidade" as const, label: "Vida Un.", cor: CATEGORIAS_CORES.vida_unidade },
  { key: "identidade" as const, label: "Ident.", cor: CATEGORIAS_CORES.identidade },
  { key: "formacao" as const, label: "Form.", cor: CATEGORIAS_CORES.formacao },
  { key: "social" as const, label: "Social", cor: CATEGORIAS_CORES.social },
  { key: "demeritos" as const, label: "Dem.", cor: "#DC3545" },
];

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    msg: string;
  } | null>(null);

  async function carregarRanking() {
    setLoading(true);
    try {
      const url = filtro
        ? `/api/admin/campeonato/ranking?filtro=${encodeURIComponent(filtro)}`
        : "/api/admin/campeonato/ranking";
      const res = await fetch(url);
      if (res.ok) {
        setRanking(await res.json());
        setUltimaAtualizacao(new Date());
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSincronizar() {
    setSincronizando(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/campeonato/sincronizar-ranking", {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json();
        setFeedback({ tipo: "erro", msg: json.error || "Erro ao sincronizar" });
      } else {
        setFeedback({ tipo: "sucesso", msg: "Ranking sincronizado." });
        await carregarRanking();
      }
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao sincronizar ranking" });
    } finally {
      setSincronizando(false);
    }
  }

  useEffect(() => {
    carregarRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    carregarRanking();
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Ranking do Campeonato 2026
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Calculado em tempo real
            {ultimaAtualizacao && (
              <span className="ml-2 text-gray-400">
                · Atualizado{" "}
                {ultimaAtualizacao.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSincronizar}
            disabled={sincronizando || loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`h-4 w-4 ${sincronizando ? "animate-spin" : ""}`} />
            {sincronizando ? "Sincronizando..." : "Sincronizar Cache"}
          </button>
          <button
            onClick={carregarRanking}
            disabled={loading || sincronizando}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-sm ${
            feedback.tipo === "sucesso"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Busca */}
      <form onSubmit={handleBuscar} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="Buscar unidade..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Top 3 Cards */}
      {!loading && ranking.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ranking.slice(0, 3).map((item, idx) => (
            <div
              key={item.unidadeId}
              className={`bg-white rounded-xl border-2 p-4 ${
                idx === 0
                  ? "border-yellow-400 shadow-yellow-100 shadow-md"
                  : idx === 1
                  ? "border-gray-300 shadow-sm"
                  : "border-orange-300 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{item.badge || `${idx + 1}º`}</span>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.unidadeCor }}
                />
              </div>
              <p className="font-bold text-gray-900">{item.unidadeNome}</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {item.total.toLocaleString("pt-BR")}
                <span className="text-sm font-normal text-gray-500 ml-1">pts</span>
              </p>
              {/* Mini breakdown */}
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                {item.compromisso > 0 && (
                  <span style={{ color: CATEGORIAS_CORES.compromisso }}>Cham. {item.compromisso}</span>
                )}
                {item.dinamicas > 0 && (
                  <span style={{ color: "#8B5CF6" }}>Din. {item.dinamicas}</span>
                )}
                {item.mensalidades > 0 && (
                  <span style={{ color: "#059669" }}>Mens. {item.mensalidades}</span>
                )}
                {item.formacao > 0 && (
                  <span style={{ color: CATEGORIAS_CORES.formacao }}>Form. {item.formacao}</span>
                )}
                {item.demeritos > 0 && (
                  <span className="text-red-500">Dem. -{item.demeritos}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela Desktop */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase w-10">
                  #
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Unidade
                </th>
                {COLUNAS.map((col) => (
                  <th
                    key={col.key}
                    className="text-center px-2 py-3 text-xs font-semibold uppercase"
                    style={{ color: col.cor }}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700 uppercase">
                  Total
                </th>
                <th className="text-center px-2 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-gray-400">
                    Carregando...
                  </td>
                </tr>
              ) : ranking.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-gray-400">
                    Nenhuma unidade no ranking.
                  </td>
                </tr>
              ) : (
                ranking.map((item, idx) => (
                  <tr
                    key={item.unidadeId}
                    className={`hover:bg-gray-50 transition-colors ${idx < 3 ? "font-medium" : ""}`}
                  >
                    <td className="px-3 py-3 text-gray-500">{item.posicao}º</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.unidadeCor }}
                        />
                        <span className="text-gray-900">{item.unidadeNome}</span>
                      </div>
                    </td>
                    {COLUNAS.map((col) => {
                      const val = item[col.key];
                      const isDem = col.key === "demeritos";
                      return (
                        <td
                          key={col.key}
                          className="text-center px-2 py-3"
                          style={{ color: val > 0 ? col.cor : "#d1d5db" }}
                        >
                          {isDem && val > 0 ? `-${val}` : val}
                        </td>
                      );
                    })}
                    <td className="text-right px-3 py-3 font-bold text-primary">
                      {item.total.toLocaleString("pt-BR")}
                    </td>
                    <td className="text-center px-2 py-3">
                      {item.badge || <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Mobile */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Carregando...</div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Nenhuma unidade no ranking.
          </div>
        ) : (
          ranking.map((item) => (
            <div
              key={item.unidadeId}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              {/* Cabeçalho do card */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-400 w-8">
                    {item.badge || `${item.posicao}º`}
                  </span>
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.unidadeCor }}
                  />
                  <span className="font-semibold text-gray-900">
                    {item.unidadeNome}
                  </span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {item.total.toLocaleString("pt-BR")}
                </span>
              </div>

              {/* Breakdown em grid */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { label: "Chamada", val: item.compromisso, cor: CATEGORIAS_CORES.compromisso },
                  { label: "Dinâm.", val: item.dinamicas, cor: "#8B5CF6" },
                  { label: "Mens.", val: item.mensalidades, cor: "#059669" },
                  { label: "Vida Un.", val: item.vidaUnidade, cor: CATEGORIAS_CORES.vida_unidade },
                  { label: "Ident.", val: item.identidade, cor: CATEGORIAS_CORES.identidade },
                  { label: "Form.", val: item.formacao, cor: CATEGORIAS_CORES.formacao },
                  { label: "Social", val: item.social, cor: CATEGORIAS_CORES.social },
                  { label: "Dem.", val: item.demeritos, cor: "#DC3545" },
                ].map((col) => (
                  <div
                    key={col.label}
                    className="text-center rounded-lg bg-gray-50 py-1.5"
                  >
                    <p className="text-[10px] text-gray-400">{col.label}</p>
                    <p
                      className="font-bold"
                      style={{ color: col.val > 0 ? col.cor : "#d1d5db" }}
                    >
                      {col.label === "Dem." && col.val > 0
                        ? `-${col.val}`
                        : col.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
