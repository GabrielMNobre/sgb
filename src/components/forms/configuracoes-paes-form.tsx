"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import type { ConfiguracoesPaes, ConfiguracoesPaesFormData } from "@/types/paes";

interface ConfiguracoesPaesFormProps {
  configuracoes: ConfiguracoesPaes;
  onSubmit: (data: ConfiguracoesPaesFormData) => Promise<void>;
}

export function ConfiguracoesPaesForm({
  configuracoes,
  onSubmit,
}: ConfiguracoesPaesFormProps) {
  const [formData, setFormData] = useState<ConfiguracoesPaesFormData>({
    valorUnitarioPadrao: configuracoes.valorUnitarioPadrao,
    paesPorFornada: configuracoes.paesPorFornada,
  });
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    setFormData({
      valorUnitarioPadrao: configuracoes.valorUnitarioPadrao,
      paesPorFornada: configuracoes.paesPorFornada,
    });
  }, [configuracoes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.valorUnitarioPadrao <= 0 || formData.paesPorFornada <= 0) {
      return;
    }

    setLoading(true);
    setSucesso(false);
    try {
      await onSubmit(formData);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valor Unitário Padrão */}
        <div>
          <label
            htmlFor="valorUnitarioPadrao"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Valor Unitário Padrão (R$) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="valorUnitarioPadrao"
            value={formData.valorUnitarioPadrao || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                valorUnitarioPadrao: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0,00"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        {/* Pães por Fornada */}
        <div>
          <label
            htmlFor="paesPorFornada"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Pães por Fornada <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="paesPorFornada"
            value={formData.paesPorFornada || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                paesPorFornada: parseInt(e.target.value) || 1,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            min="1"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <><Loading size="sm" className="mr-2" />Salvando...</> : "Salvar"}
        </Button>

        {sucesso && (
          <span className="text-sm text-green-600 font-medium">
            Configurações salvas com sucesso!
          </span>
        )}
      </div>
    </form>
  );
}
