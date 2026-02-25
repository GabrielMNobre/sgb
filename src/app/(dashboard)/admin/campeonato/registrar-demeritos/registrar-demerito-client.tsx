"use client";

import { useState, useEffect, useCallback } from "react";
import type { Unidade } from "@/types/unidade";
import type { DemeritoCampeonato, TipoDemerito } from "@/types/campeonato";
import { DEMERITOS_CONFIG, NIVEL_CORES } from "@/types/campeonato";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";

interface Props {
  unidades: Unidade[];
}

// Agrupa deméritos por nível
const DEMERITOS_POR_NIVEL = {
  D1: DEMERITOS_CONFIG.filter((d) => d.nivel === "D1"),
  D2: DEMERITOS_CONFIG.filter((d) => d.nivel === "D2"),
  D3: DEMERITOS_CONFIG.filter((d) => d.nivel === "D3"),
  D4: DEMERITOS_CONFIG.filter((d) => d.nivel === "D4"),
};

function getNivelDemerito(tipo: string): string {
  return tipo.split("_")[0].toUpperCase();
}

function getLabelDemerito(tipo: string): string {
  const config = DEMERITOS_CONFIG.find((d) => d.value === tipo as any);
  return config?.label || tipo;
}

function getPontosDemerito(tipo: string): number {
  const config = DEMERITOS_CONFIG.find((d) => d.value === tipo as any);
  return config?.pontos || 0;
}

function hoje(): string {
  return new Date().toISOString().split("T")[0];
}

export function RegistrarDemeritoClient({ unidades }: Props) {
  const [unidadeId, setUnidadeId] = useState("");
  const [data, setData] = useState(hoje());
  const [tipoDemeritos, setTipoDemeritos] = useState<TipoDemerito | "">("");
  const [descricao, setDescricao] = useState("");
  const [demeritos, setDemeritos] = useState<DemeritoCampeonato[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDemeritos, setLoadingDemeritos] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    msg: string;
  } | null>(null);

  const nivelSelecionado = tipoDemeritos
    ? getNivelDemerito(tipoDemeritos)
    : "";
  const precisaDescricao =
    nivelSelecionado === "D3" || nivelSelecionado === "D4";
  const pontosPreview = tipoDemeritos ? getPontosDemerito(tipoDemeritos) : null;

  const carregarDemeritos = useCallback(async () => {
    if (!unidadeId || !data) return;
    setLoadingDemeritos(true);
    try {
      const res = await fetch(
        `/api/admin/campeonato/demeritos?unidade_id=${unidadeId}&data=${data}`
      );
      if (res.ok) {
        const dados = await res.json();
        setDemeritos(dados);
      }
    } finally {
      setLoadingDemeritos(false);
    }
  }, [unidadeId, data]);

  useEffect(() => {
    carregarDemeritos();
  }, [carregarDemeritos]);

  function limparFormulario() {
    setTipoDemeritos("");
    setDescricao("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!unidadeId || !data || !tipoDemeritos) {
      setFeedback({
        tipo: "erro",
        msg: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    if (precisaDescricao && !descricao.trim()) {
      setFeedback({
        tipo: "erro",
        msg: "Deméritos D3 e D4 exigem descrição obrigatória.",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/campeonato/demeritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unidadeId,
          dataOcorrencia: data,
          tipoDemeritos,
          descricao: descricao || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFeedback({
          tipo: "erro",
          msg: json.error || "Erro ao registrar demérito",
        });
        return;
      }

      setFeedback({ tipo: "sucesso", msg: "Demérito registrado com sucesso!" });
      limparFormulario();
      await carregarDemeritos();
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao registrar demérito" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm("Deseja deletar este demérito?")) return;

    try {
      const res = await fetch(`/api/admin/campeonato/demeritos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await carregarDemeritos();
        setFeedback({ tipo: "sucesso", msg: "Demérito removido." });
      } else {
        setFeedback({ tipo: "erro", msg: "Erro ao deletar demérito." });
      }
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao deletar demérito." });
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Registrar Demérito</h1>
        <p className="text-sm text-gray-500 mt-1">
          Campeonato 2026 — Registre deméritos por unidade
        </p>
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

      {/* Seleção Unidade e Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Selecionar Unidade e Data
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={unidadeId}
              onChange={(e) => setUnidadeId(e.target.value)}
            >
              <option value="">Selecione a unidade</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={data}
              min="2026-02-01"
              max={hoje()}
              onChange={(e) => setData(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Período: 01/02/2026 a 30/11/2026
            </p>
          </div>
        </div>
      </div>

      {/* Deméritos registrados */}
      {unidadeId && data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Deméritos Registrados{" "}
            {loadingDemeritos && (
              <span className="text-xs font-normal text-gray-400">
                (carregando...)
              </span>
            )}
          </h2>
          {demeritos.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Nenhum demérito registrado para esta unidade nesta data.
            </p>
          ) : (
            <div className="space-y-2">
              {demeritos.map((dem) => {
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
                        {getLabelDemerito(dem.tipoDemeritos)}
                      </span>
                      <span className="text-xs text-red-500">
                        {dem.pontosPerdidos} pts
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletar(dem.id)}
                      className="p-1.5 hover:bg-red-200 text-red-600 rounded transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              <div className="pt-1 text-right">
                <span className="text-sm font-semibold text-red-700">
                  Total:{" "}
                  {demeritos.reduce((s, d) => s + (d.pontosPerdidos || 0), 0)} pts
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulário */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Novo Demérito
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Demérito */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Demérito <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={tipoDemeritos}
              onChange={(e) => setTipoDemeritos(e.target.value as TipoDemerito)}
            >
              <option value="">Selecione o tipo de demérito</option>
              {(
                Object.entries(DEMERITOS_POR_NIVEL) as [
                  string,
                  typeof DEMERITOS_CONFIG
                ][]
              ).map(([nivel, tipos]) => (
                <optgroup
                  key={nivel}
                  label={`${nivel} — ${
                    nivel === "D1"
                      ? "Leves"
                      : nivel === "D2"
                      ? "Moderados"
                      : nivel === "D3"
                      ? "Graves"
                      : "Críticos"
                  }`}
                >
                  {tipos.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.pontos} pts)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {pontosPreview !== null && (
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-1 rounded text-white"
                  style={{
                    backgroundColor: NIVEL_CORES[nivelSelecionado] || "#DC3545",
                  }}
                >
                  {nivelSelecionado}
                </span>
                <span className="text-sm font-semibold text-red-700">
                  {pontosPreview} pts
                </span>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição{" "}
              {precisaDescricao ? (
                <span className="text-red-500">* (obrigatório para D3/D4)</span>
              ) : (
                <span className="text-gray-400 font-normal">(opcional)</span>
              )}
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              rows={3}
              maxLength={500}
              placeholder={
                precisaDescricao
                  ? "Descreva o ocorrido em detalhes (obrigatório)..."
                  : "Observações sobre o demérito..."
              }
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {descricao.length}/500
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !unidadeId || !data}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrando..." : "Registrar Demérito"}
            </button>
            <button
              type="button"
              onClick={limparFormulario}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
