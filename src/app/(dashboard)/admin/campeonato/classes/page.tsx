"use client";

import { useState, useEffect, useCallback } from "react";
import type { AcompanhamentoClasses } from "@/types/campeonato";
import { CheckCircle, XCircle, BookOpen, Plus, Minus } from "lucide-react";

interface Unidade {
  id: string;
  nome: string;
  corPrimaria: string;
}

interface ClassesForm {
  classeRegularCompletada: boolean;
  dataConclusaoRegular: string;
  classeAvancadaCompletada: boolean;
  dataConclusaoAvancada: string;
  classeBiblicaEmDia: boolean;
  totalEspecialidades: number;
}

export default function ClassesPage() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [unidadeId, setUnidadeId] = useState("");
  const [classes, setClasses] = useState<AcompanhamentoClasses | null>(null);
  const [form, setForm] = useState<ClassesForm>({
    classeRegularCompletada: false,
    dataConclusaoRegular: "",
    classeAvancadaCompletada: false,
    dataConclusaoAvancada: "",
    classeBiblicaEmDia: false,
    totalEspecialidades: 0,
  });
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    msg: string;
  } | null>(null);

  // Carrega unidades
  useEffect(() => {
    fetch("/api/admin/campeonato/ranking")
      .then((r) => r.json())
      .then((dados) => {
        // Extrai unidades do ranking
        const units = dados.map((r: any) => ({
          id: r.unidadeId,
          nome: r.unidadeNome,
          corPrimaria: r.unidadeCor,
        }));
        setUnidades(units);
      })
      .catch(() => {
        // Fallback: busca direto de unidades
        fetch("/api/admin/campeonato/status-classes");
      });
  }, []);

  const carregarClasses = useCallback(async () => {
    if (!unidadeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/campeonato/classes/${unidadeId}`);
      if (res.ok) {
        const dados: AcompanhamentoClasses = await res.json();
        setClasses(dados);
        setForm({
          classeRegularCompletada: dados.classeRegularCompletada || false,
          dataConclusaoRegular: dados.dataConclusaoRegular || "",
          classeAvancadaCompletada: dados.classeAvancadaCompletada || false,
          dataConclusaoAvancada: dados.dataConclusaoAvancada || "",
          classeBiblicaEmDia: dados.classeBiblicaEmDia || false,
          totalEspecialidades: dados.totalEspecialidades || 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [unidadeId]);

  useEffect(() => {
    carregarClasses();
  }, [carregarClasses]);

  async function handleSalvar() {
    if (!unidadeId) return;
    setSalvando(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/campeonato/classes/${unidadeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classeRegularCompletada: form.classeRegularCompletada,
          dataConclusaoRegular: form.classeRegularCompletada
            ? form.dataConclusaoRegular || undefined
            : undefined,
          classeAvancadaCompletada: form.classeAvancadaCompletada,
          dataConclusaoAvancada: form.classeAvancadaCompletada
            ? form.dataConclusaoAvancada || undefined
            : undefined,
          classeBiblicaEmDia: form.classeBiblicaEmDia,
          totalEspecialidades: form.totalEspecialidades,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFeedback({
          tipo: "erro",
          msg: json.error || "Erro ao atualizar classes",
        });
      } else {
        setFeedback({ tipo: "sucesso", msg: "Classes atualizadas com sucesso!" });
        setClasses(json);
      }
    } catch {
      setFeedback({ tipo: "erro", msg: "Erro ao atualizar classes" });
    } finally {
      setSalvando(false);
    }
  }

  function calcularPontos(): number {
    let pts = 0;
    if (form.classeRegularCompletada) pts += 200;
    if (form.classeAvancadaCompletada) pts += 300;
    if (form.classeBiblicaEmDia) pts += 200;
    pts += Math.min(form.totalEspecialidades, 20) * 100;
    return pts;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Acompanhamento de Classes
        </h1>
        <p className="text-sm text-gray-500 mt-1">Campeonato 2026</p>
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

      {/* Seleção de Unidade */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Unidade
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

      {/* Formulário */}
      {unidadeId && (
        <>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Carregando...</div>
          ) : (
            <>
              {/* Total de Pontos das Classes */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  Total de Pontos das Classes
                </span>
                <span className="text-xl font-bold text-primary">
                  {calcularPontos().toLocaleString("pt-BR")} pts
                </span>
              </div>

              {/* Classe Regular */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Classe Regular
                  </h2>
                  <span className="ml-auto text-xs text-gray-400">
                    Deadline: 28/06/2026
                  </span>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      checked={form.classeRegularCompletada}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          classeRegularCompletada: e.target.checked,
                          dataConclusaoRegular: e.target.checked
                            ? f.dataConclusaoRegular
                            : "",
                        }))
                      }
                    />
                    <span className="text-sm text-gray-700">
                      Classe Regular Completada
                    </span>
                    <span
                      className={`ml-auto text-xs font-bold px-2 py-0.5 rounded ${
                        form.classeRegularCompletada
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {form.classeRegularCompletada ? "+200 pts" : "0 pts"}
                    </span>
                  </label>
                  {form.classeRegularCompletada && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Data de Conclusão
                      </label>
                      <input
                        type="date"
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        max="2026-06-28"
                        value={form.dataConclusaoRegular}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            dataConclusaoRegular: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Classe Avançada */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Classe Avançada
                  </h2>
                  <span className="ml-auto text-xs text-gray-400">
                    Deadline: 25/10/2026
                  </span>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      checked={form.classeAvancadaCompletada}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          classeAvancadaCompletada: e.target.checked,
                          dataConclusaoAvancada: e.target.checked
                            ? f.dataConclusaoAvancada
                            : "",
                        }))
                      }
                    />
                    <span className="text-sm text-gray-700">
                      Classe Avançada Completada
                    </span>
                    <span
                      className={`ml-auto text-xs font-bold px-2 py-0.5 rounded ${
                        form.classeAvancadaCompletada
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {form.classeAvancadaCompletada ? "+300 pts" : "0 pts"}
                    </span>
                  </label>
                  {form.classeAvancadaCompletada && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Data de Conclusão
                      </label>
                      <input
                        type="date"
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        max="2026-10-25"
                        value={form.dataConclusaoAvancada}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            dataConclusaoAvancada: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Classe Bíblica */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Classe Bíblica
                  </h2>
                  <span className="ml-auto text-xs text-gray-400">Contínuo</span>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    checked={form.classeBiblicaEmDia}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        classeBiblicaEmDia: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm text-gray-700">Em Dia</span>
                  <span
                    className={`ml-auto text-xs font-bold px-2 py-0.5 rounded ${
                      form.classeBiblicaEmDia
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {form.classeBiblicaEmDia ? "+200 pts" : "0 pts (Com Atraso)"}
                  </span>
                </label>
              </div>

              {/* Especialidades */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🎖️</span>
                  <h2 className="text-base font-semibold text-gray-800">
                    Especialidades
                  </h2>
                  <span className="ml-auto text-xs text-gray-400">
                    Máximo 20 × 100 = 2000 pts
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          totalEspecialidades: Math.max(
                            0,
                            f.totalEspecialidades - 1
                          ),
                        }))
                      }
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
                      disabled={form.totalEspecialidades <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-bold text-primary">
                        {form.totalEspecialidades}
                      </span>
                      <span className="text-gray-400">/20</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          totalEspecialidades: Math.min(
                            20,
                            f.totalEspecialidades + 1
                          ),
                        }))
                      }
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
                      disabled={form.totalEspecialidades >= 20}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {form.totalEspecialidades} × 100 pts
                    </span>
                    <span className="font-bold text-primary">
                      = {(Math.min(form.totalEspecialidades, 20) * 100).toLocaleString("pt-BR")} pts
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (form.totalEspecialidades / 20) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Botão Salvar */}
              <button
                onClick={handleSalvar}
                disabled={salvando}
                className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvando ? "Salvando..." : "Salvar Classes"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
