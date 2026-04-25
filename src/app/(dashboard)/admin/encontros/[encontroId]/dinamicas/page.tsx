"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Users,
  Trash2,
  CheckCircle,
  XCircle,
  Gamepad2,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import type { Encontro } from "@/types/encontro";
import type { AvaliacaoCampeonato } from "@/types/campeonato";

interface Unidade {
  id: string;
  nome: string;
  corPrimaria: string;
}

interface DinamicaRegistrada {
  nome: string;
  tipo: "colocacao" | "para_todos";
  avaliacoes: AvaliacaoCampeonato[];
}

type TipoDinamica = "colocacao" | "para_todos";

const COR_BADGE: Record<string, string> = {
  verde: "bg-green-100 text-green-700 border-green-200",
  amarelo: "bg-yellow-100 text-yellow-700 border-yellow-200",
  vermelho: "bg-red-100 text-red-700 border-red-200",
};

const COLOCACAO_LABELS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: "🥇", label: "1º Lugar" },
  2: { emoji: "🥈", label: "2º Lugar" },
  3: { emoji: "🥉", label: "3º Lugar" },
};

export default function DinamicasPage() {
  const params = useParams();
  const router = useRouter();
  const encontroId = params.encontroId as string;

  const [encontro, setEncontro] = useState<Encontro | null>(null);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [dinamicas, setDinamicas] = useState<DinamicaRegistrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    msg: string;
  } | null>(null);

  // Form state
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoDinamica>("colocacao");
  const [primeiro, setPrimeiro] = useState("");
  const [segundo, setSegundo] = useState("");
  const [terceiro, setTerceiro] = useState("");
  const [participaram, setParticiparam] = useState<string[]>([]);
  const [paraTodosSelecionadas, setParaTodosSelecionadas] = useState<string[]>([]);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [encontroRes, dinamicasRes, rankingRes] = await Promise.all([
        fetch(`/api/encontros/${encontroId}`),
        fetch(`/api/encontros/${encontroId}/dinamicas`),
        fetch("/api/admin/campeonato/ranking"),
      ]);

      if (encontroRes.ok) {
        setEncontro(await encontroRes.json());
      }
      if (dinamicasRes.ok) {
        setDinamicas(await dinamicasRes.json());
      }
      if (rankingRes.ok) {
        const rankingData = await rankingRes.json();
        setUnidades(
          rankingData.map((r: any) => ({
            id: r.unidadeId,
            nome: r.unidadeNome,
            corPrimaria: r.unidadeCor,
          }))
        );
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [encontroId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function limparFormulario() {
    setNome("");
    setTipo("colocacao");
    setPrimeiro("");
    setSegundo("");
    setTerceiro("");
    setParticiparam([]);
    setParaTodosSelecionadas([]);
  }

  function toggleParticipou(unidadeId: string) {
    setParticiparam((prev) =>
      prev.includes(unidadeId)
        ? prev.filter((id) => id !== unidadeId)
        : [...prev, unidadeId]
    );
  }

  function toggleParaTodos(unidadeId: string) {
    setParaTodosSelecionadas((prev) =>
      prev.includes(unidadeId)
        ? prev.filter((id) => id !== unidadeId)
        : [...prev, unidadeId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setFeedback({ tipo: "erro", msg: "Nome da dinâmica é obrigatório." });
      return;
    }

    let resultados: { unidadeId: string; colocacao: number | null }[] = [];

    if (tipo === "colocacao") {
      if (!primeiro && !segundo && !terceiro && participaram.length === 0) {
        setFeedback({
          tipo: "erro",
          msg: "Selecione pelo menos uma unidade.",
        });
        return;
      }

      if (primeiro) resultados.push({ unidadeId: primeiro, colocacao: 1 });
      if (segundo) resultados.push({ unidadeId: segundo, colocacao: 2 });
      if (terceiro) resultados.push({ unidadeId: terceiro, colocacao: 3 });

      // Adiciona unidades que participaram mas não ficaram no pódio
      const podio = new Set([primeiro, segundo, terceiro].filter(Boolean));
      for (const uid of participaram) {
        if (!podio.has(uid)) {
          resultados.push({ unidadeId: uid, colocacao: null });
        }
      }
    } else {
      if (paraTodosSelecionadas.length === 0) {
        setFeedback({
          tipo: "erro",
          msg: "Selecione pelo menos uma unidade.",
        });
        return;
      }
      resultados = paraTodosSelecionadas.map((uid) => ({
        unidadeId: uid,
        colocacao: null,
      }));
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/encontros/${encontroId}/dinamicas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), tipo, resultados }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFeedback({
          tipo: "erro",
          msg: json.error || "Erro ao registrar dinâmica",
        });
        return;
      }

      setFeedback({ tipo: "sucesso", msg: "Dinâmica registrada com sucesso!" });
      limparFormulario();
      await carregarDados();
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao registrar dinâmica" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletar(nomeDinamica: string) {
    if (!confirm(`Deseja deletar a dinâmica "${nomeDinamica}"?`)) return;

    try {
      const res = await fetch(
        `/api/encontros/${encontroId}/dinamicas?nome=${encodeURIComponent(nomeDinamica)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setFeedback({ tipo: "sucesso", msg: "Dinâmica deletada com sucesso!" });
        await carregarDados();
      } else {
        const json = await res.json();
        setFeedback({
          tipo: "erro",
          msg: json.error || "Erro ao deletar dinâmica",
        });
      }
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao deletar dinâmica" });
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loading size="lg" />
        <p className="text-gray-500 mt-3">Carregando...</p>
      </div>
    );
  }

  if (!encontro) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Encontro não encontrado</p>
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/encontros")}
          className="mt-4"
        >
          Voltar
        </Button>
      </div>
    );
  }

  const podeEditar = encontro.status === "em_andamento" || encontro.status === "finalizado";

  // Unidades disponíveis para seleção de pódio (exclui as já escolhidas)
  const podioSelecionados = new Set(
    [primeiro, segundo, terceiro].filter(Boolean)
  );
  const unidadesParaPodio = (pos: string) =>
    unidades.filter(
      (u) => u.id === pos || !podioSelecionados.has(u.id)
    );

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/admin/encontros/${encontroId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dinâmicas</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-gray-500">
              Encontro: {formatDate(encontro.data)}
            </p>
            <Badge
              variant={
                encontro.status === "em_andamento" ? "warning" : encontro.status === "finalizado" ? "success" : "default"
              }
            >
              {encontro.status === "em_andamento"
                ? "Em Andamento"
                : encontro.status === "finalizado"
                ? "Finalizado"
                : "Agendado"}
            </Badge>
          </div>
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

      {/* Formulário - só se em andamento */}
      {podeEditar && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info da dinâmica */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Nova Dinâmica
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Dinâmica <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Ex: Corrida de Revezamento"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTipo("colocacao")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      tipo === "colocacao"
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Trophy className="h-4 w-4" />
                    Colocação
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo("para_todos")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      tipo === "para_todos"
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Para Todos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 2A: Colocação */}
          {tipo === "colocacao" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
              {/* Pódio */}
              {[
                {
                  pos: 1,
                  value: primeiro,
                  setter: setPrimeiro,
                  cor: "border-yellow-400 bg-yellow-50",
                  pts: "50 pts - Verde",
                },
                {
                  pos: 2,
                  value: segundo,
                  setter: setSegundo,
                  cor: "border-gray-300 bg-gray-50",
                  pts: "40 pts - Amarelo",
                },
                {
                  pos: 3,
                  value: terceiro,
                  setter: setTerceiro,
                  cor: "border-orange-300 bg-orange-50",
                  pts: "30 pts - Vermelho",
                },
              ].map(({ pos, value, setter, cor, pts }) => (
                <div key={pos} className={`border-2 rounded-lg p-4 ${cor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {COLOCACAO_LABELS[pos].emoji}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        {COLOCACAO_LABELS[pos].label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{pts}</span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                    >
                      <option value="">Selecionar unidade</option>
                      {unidadesParaPodio(value).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome}
                        </option>
                      ))}
                    </select>
                    {value && (
                      <button
                        type="button"
                        onClick={() => setter("")}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Participaram */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📌</span>
                    <span className="text-sm font-semibold text-gray-700">
                      Participaram
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    20 pts - Vermelho
                  </span>
                </div>
                <div className="space-y-2">
                  {unidades
                    .filter((u) => !podioSelecionados.has(u.id))
                    .map((u) => (
                      <label
                        key={u.id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                          checked={participaram.includes(u.id)}
                          onChange={() => toggleParticipou(u.id)}
                        />
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: u.corPrimaria }}
                          />
                          <span className="text-sm text-gray-700">
                            {u.nome}
                          </span>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Passo 2B: Para Todos */}
          {tipo === "para_todos" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span className="text-sm font-semibold text-gray-700">
                    Todos Ganham 50 Pontos
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setParaTodosSelecionadas(unidades.map((u) => u.id))
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    Selecionar Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setParaTodosSelecionadas([])}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {unidades.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      checked={paraTodosSelecionadas.includes(u.id)}
                      onChange={() => toggleParaTodos(u.id)}
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: u.corPrimaria }}
                      />
                      <span className="text-sm text-gray-700">{u.nome}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Registrando..." : "Registrar Dinâmica"}
            </button>
            <button
              type="button"
              onClick={limparFormulario}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Limpar
            </button>
          </div>
        </form>
      )}

      {/* Dinâmicas Registradas */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Dinâmicas Registradas ({dinamicas.length})
        </h2>

        {dinamicas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <Gamepad2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Nenhuma dinâmica registrada neste encontro.
            </p>
          </div>
        ) : (
          dinamicas.map((din) => (
            <div
              key={din.nome}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-gray-900">{din.nome}</h3>
                  <Badge variant="default">
                    {din.tipo === "colocacao" ? "Colocação" : "Para Todos"}
                  </Badge>
                </div>
                {podeEditar && (
                  <button
                    onClick={() => handleDeletar(din.nome)}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {din.avaliacoes
                  .sort((a, b) => b.pontos - a.pontos)
                  .map((av) => {
                    const unidade = unidades.find(
                      (u) => u.id === av.unidadeId
                    );
                    const desc = av.descricao || "";
                    const colMatch = desc.match(/Colocação: (\d)º/);
                    const colNum = colMatch ? parseInt(colMatch[1]) : null;

                    return (
                      <div
                        key={av.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                          COR_BADGE[av.cor] || COR_BADGE.vermelho
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {colNum && (
                            <span className="text-sm">
                              {COLOCACAO_LABELS[colNum]?.emoji}
                            </span>
                          )}
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                unidade?.corPrimaria || "#6b7280",
                            }}
                          />
                          <span className="text-sm font-medium">
                            {unidade?.nome || "Unidade"}
                          </span>
                        </div>
                        <span className="text-sm font-bold">
                          +{av.pontos} pts
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
