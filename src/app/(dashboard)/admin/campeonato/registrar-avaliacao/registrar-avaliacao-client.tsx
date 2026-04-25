"use client";

import { useState, useEffect, useCallback } from "react";
import type { Unidade } from "@/types/unidade";
import type {
  AvaliacaoCampeonato,
  CategoriaCampeonato,
  TipoAvaliacaoCampeonato,
  CorAvaliacao,
} from "@/types/campeonato";
import {
  CATEGORIAS_LABELS,
  TIPOS_POR_CATEGORIA,
  COR_PONTOS,
  COR_LABELS,
} from "@/types/campeonato";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";

interface Props {
  unidades: Unidade[];
}

const COR_BTN: Record<CorAvaliacao, string> = {
  verde: "bg-green-500 hover:bg-green-600 text-white ring-green-400",
  amarelo: "bg-yellow-400 hover:bg-yellow-500 text-white ring-yellow-300",
  vermelho: "bg-red-500 hover:bg-red-600 text-white ring-red-400",
};

const COR_BADGE: Record<CorAvaliacao, string> = {
  verde: "bg-green-100 text-green-700 border-green-200",
  amarelo: "bg-yellow-100 text-yellow-700 border-yellow-200",
  vermelho: "bg-red-100 text-red-700 border-red-200",
};

function hoje(): string {
  return new Date().toISOString().split("T")[0];
}

export function RegistrarAvaliacaoClient({ unidades }: Props) {
  const [unidadeId, setUnidadeId] = useState("");
  const [data, setData] = useState(hoje());
  const [categoria, setCategoria] = useState<CategoriaCampeonato | "">("");
  const [tipoAvaliacao, setTipoAvaliacao] = useState<TipoAvaliacaoCampeonato | "">("");
  const [cor, setCor] = useState<CorAvaliacao | "">("");
  const [descricao, setDescricao] = useState("");
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoCampeonato[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    msg: string;
  } | null>(null);

  const carregarAvaliacoes = useCallback(async () => {
    if (!unidadeId || !data) return;
    setLoadingAvaliacoes(true);
    try {
      const res = await fetch(
        `/api/admin/campeonato/avaliacoes?unidade_id=${unidadeId}&data=${data}`
      );
      if (res.ok) {
        const dados = await res.json();
        setAvaliacoes(dados);
      }
    } finally {
      setLoadingAvaliacoes(false);
    }
  }, [unidadeId, data]);

  useEffect(() => {
    carregarAvaliacoes();
  }, [carregarAvaliacoes]);

  function limparFormulario() {
    setCategoria("");
    setTipoAvaliacao("");
    setCor("");
    setDescricao("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!unidadeId || !data || !categoria || !tipoAvaliacao || !cor) {
      setFeedback({ tipo: "erro", msg: "Preencha todos os campos obrigatórios." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/campeonato/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unidadeId,
          dataAvaliacao: data,
          categoria,
          tipoAvaliacao,
          cor,
          descricao: descricao || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFeedback({ tipo: "erro", msg: json.error || "Erro ao registrar avaliação" });
        return;
      }

      setFeedback({ tipo: "sucesso", msg: "Avaliação registrada com sucesso!" });
      limparFormulario();
      await carregarAvaliacoes();
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao registrar avaliação" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm("Deseja deletar esta avaliação?")) return;

    try {
      const res = await fetch(`/api/admin/campeonato/avaliacoes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await carregarAvaliacoes();
        setFeedback({ tipo: "sucesso", msg: "Avaliação removida." });
      } else {
        setFeedback({ tipo: "erro", msg: "Erro ao deletar avaliação." });
      }
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao deletar avaliação." });
    }
  }

  const tiposDisponiveis = categoria ? TIPOS_POR_CATEGORIA[categoria] : [];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Registrar Avaliação</h1>
        <p className="text-sm text-gray-500 mt-1">
          Campeonato 2026 — Registre avaliações por unidade
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

      {/* Seleção de Unidade e Data */}
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
            <p className="text-xs text-gray-400 mt-1">Período: 01/02/2026 a 30/11/2026</p>
          </div>
        </div>
      </div>

      {/* Avaliações já registradas */}
      {unidadeId && data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Avaliações Registradas{" "}
            {loadingAvaliacoes && (
              <span className="text-xs font-normal text-gray-400">
                (carregando...)
              </span>
            )}
          </h2>
          {avaliacoes.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Nenhuma avaliação registrada para esta unidade nesta data.
            </p>
          ) : (
            <div className="space-y-2">
              {avaliacoes.map((av) => (
                <div
                  key={av.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                    COR_BADGE[av.cor]
                  }`}
                >
                  <div>
                    <span className="text-xs font-medium">
                      {CATEGORIAS_LABELS[av.categoria]} — {" "}
                      {av.tipoAvaliacao.replace(/_/g, " ")}
                    </span>
                    <span className="ml-2 text-xs">+{av.pontos} pts</span>
                  </div>
                  <button
                    onClick={() => handleDeletar(av.id)}
                    className="p-1.5 hover:bg-red-100 text-red-500 rounded transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formulário de Nova Avaliação */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Nova Avaliação
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value as CategoriaCampeonato);
                  setTipoAvaliacao("");
                }}
              >
                <option value="">Selecione a categoria</option>
                {(Object.entries(CATEGORIAS_LABELS) as [CategoriaCampeonato, string][]).map(
                  ([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-gray-400"
                value={tipoAvaliacao}
                disabled={!categoria}
                onChange={(e) =>
                  setTipoAvaliacao(e.target.value as TipoAvaliacaoCampeonato)
                }
              >
                <option value="">
                  {categoria ? "Selecione o tipo" : "Selecione a categoria primeiro"}
                </option>
                {tiposDisponiveis.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor / Pontuação <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(["verde", "amarelo", "vermelho"] as CorAvaliacao[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    COR_BTN[c]
                  } ${cor === c ? "ring-2 ring-offset-2 scale-105" : "opacity-70"}`}
                >
                  {COR_LABELS[c]} ({COR_PONTOS[c]} pts)
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              rows={3}
              maxLength={500}
              placeholder="Observações sobre a avaliação..."
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
              className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrando..." : "Registrar Avaliação"}
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
