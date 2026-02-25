"use client";

import { useState, useEffect } from "react";
import type { RankingItem } from "@/types/campeonato";
import { Search, RefreshCw, RotateCcw } from "lucide-react";

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [erroSync, setErroSync] = useState<string | null>(null);

  async function carregarRanking() {
    setLoading(true);
    try {
      const url = filtro
        ? `/api/admin/campeonato/ranking?filtro=${encodeURIComponent(filtro)}`
        : "/api/admin/campeonato/ranking";
      const res = await fetch(url);
      if (res.ok) {
        const dados = await res.json();
        setRanking(dados);
        setUltimaAtualizacao(new Date());
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSincronizar() {
    setSincronizando(true);
    setErroSync(null);
    try {
      const res = await fetch("/api/admin/campeonato/sincronizar-ranking", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        setErroSync(json.error || "Erro ao sincronizar");
      } else {
        await carregarRanking();
      }
    } catch {
      setErroSync("Erro ao sincronizar ranking");
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
            Período: 01/02/2026 a 30/11/2026
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
            {sincronizando ? "Sincronizando..." : "Sincronizar Pontos"}
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

      {/* Erro sincronização */}
      {erroSync && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {erroSync}
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
            </div>
          ))}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-12">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Unidade
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase">
                  Total
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase w-12">
                  🏅
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Carregando...
                  </td>
                </tr>
              ) : ranking.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Nenhuma unidade no ranking ainda.
                  </td>
                </tr>
              ) : (
                ranking.map((item, idx) => (
                  <tr
                    key={item.unidadeId}
                    className={`hover:bg-gray-50 transition-colors ${
                      idx < 3 ? "font-medium" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-500">{idx + 1}º</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.unidadeCor }}
                        />
                        <span className="text-gray-900">{item.unidadeNome}</span>
                      </div>
                    </td>
                    <td className="text-right px-4 py-3 font-bold text-primary">
                      {item.total.toLocaleString("pt-BR")}
                    </td>
                    <td className="text-center px-3 py-3">
                      {item.badge || <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
