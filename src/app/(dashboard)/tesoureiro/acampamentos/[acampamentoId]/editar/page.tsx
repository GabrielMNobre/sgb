"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import type { Acampamento, AcampamentoFormData } from "@/types/acampamento";
import { atualizarAcampamentoAction } from "../../actions";

export default function EditarAcampamentoPage({
  params,
}: {
  params: Promise<{ acampamentoId: string }>;
}) {
  const { acampamentoId } = use(params);
  const router = useRouter();
  const [acampamento, setAcampamento] = useState<Acampamento | null>(null);
  const [formData, setFormData] = useState<AcampamentoFormData>({
    nome: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    valorPorPessoa: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [acampamentoId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/acampamentos/${acampamentoId}`);
      if (response.ok) {
        const data = await response.json();
        const acamp = data.acampamento;
        if (acamp) {
          setAcampamento(acamp);
          setFormData({
            nome: acamp.nome,
            descricao: acamp.descricao || "",
            dataInicio: new Date(acamp.dataInicio).toISOString().split("T")[0],
            dataFim: new Date(acamp.dataFim).toISOString().split("T")[0],
            valorPorPessoa: acamp.valorPorPessoa,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar acampamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await atualizarAcampamentoAction(acampamentoId, formData);
      router.push(`/tesoureiro/acampamentos/${acampamentoId}`);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!acampamento) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Acampamento não encontrado</p>
      </div>
    );
  }

  if (acampamento.status === "finalizado") {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Acampamento finalizado não pode ser editado.
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => router.push(`/tesoureiro/acampamentos/${acampamentoId}`)}
        >
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/tesoureiro/acampamentos/${acampamentoId}`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Editar Acampamento
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{acampamento.nome}</p>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="descricao"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descrição (opcional)
              </label>
              <Textarea
                id="descricao"
                value={formData.descricao || ""}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                placeholder="Informações adicionais..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="dataInicio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data Início <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dataInicio"
                  value={formData.dataInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, dataInicio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="dataFim"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data Fim <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dataFim"
                  value={formData.dataFim}
                  onChange={(e) =>
                    setFormData({ ...formData, dataFim: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="valorPorPessoa"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Valor por Pessoa (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="valorPorPessoa"
                value={formData.valorPorPessoa || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    valorPorPessoa: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(`/tesoureiro/acampamentos/${acampamentoId}`)
                }
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
