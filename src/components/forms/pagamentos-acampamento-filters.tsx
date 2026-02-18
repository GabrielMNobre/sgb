"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { FiltrosPagamento } from "@/types/acampamento";
import { X } from "lucide-react";

interface PagamentosAcampamentoFiltersProps {
  filtros: FiltrosPagamento;
  onFiltrosChange: (filtros: FiltrosPagamento) => void;
  participantes?: Array<{ id: string; nome: string }>;
}

export function PagamentosAcampamentoFilters({
  filtros,
  onFiltrosChange,
  participantes,
}: PagamentosAcampamentoFiltersProps) {
  const [localFiltros, setLocalFiltros] = useState<FiltrosPagamento>(filtros);

  useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros]);

  const handleChange = (key: keyof FiltrosPagamento, value: string) => {
    const newFiltros = { ...localFiltros, [key]: value || undefined };
    setLocalFiltros(newFiltros);
    onFiltrosChange(newFiltros);
  };

  const handleClear = () => {
    const emptyFiltros: FiltrosPagamento = {};
    setLocalFiltros(emptyFiltros);
    onFiltrosChange(emptyFiltros);
  };

  const hasActiveFilters =
    localFiltros.dataInicio ||
    localFiltros.dataFim ||
    localFiltros.participanteId;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Data Início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Início
          </label>
          <input
            type="date"
            value={localFiltros.dataInicio || ""}
            onChange={(e) => handleChange("dataInicio", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Data Fim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Fim
          </label>
          <input
            type="date"
            value={localFiltros.dataFim || ""}
            onChange={(e) => handleChange("dataFim", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Participante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Participante
          </label>
          <select
            value={localFiltros.participanteId || ""}
            onChange={(e) => handleChange("participanteId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            {participantes?.map((participante) => (
              <option key={participante.id} value={participante.id}>
                {participante.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Limpar filtros */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-gray-600"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
