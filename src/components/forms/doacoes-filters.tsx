"use client";

import { useState, useEffect } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import type { FiltrosDoacao } from "@/types/doacao";
import { X } from "lucide-react";

interface DoacoesFiltersProps {
  filtros: FiltrosDoacao;
  onFiltrosChange: (filtros: FiltrosDoacao) => void;
}

export function DoacoesFilters({
  filtros,
  onFiltrosChange,
}: DoacoesFiltersProps) {
  const [localFiltros, setLocalFiltros] = useState<FiltrosDoacao>(filtros);

  useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros]);

  const handleChange = (key: keyof FiltrosDoacao, value: string) => {
    const newFiltros = { ...localFiltros, [key]: value || undefined };
    setLocalFiltros(newFiltros);
    onFiltrosChange(newFiltros);
  };

  const handleClear = () => {
    const emptyFiltros: FiltrosDoacao = {};
    setLocalFiltros(emptyFiltros);
    onFiltrosChange(emptyFiltros);
  };

  const hasActiveFilters =
    localFiltros.dataInicio ||
    localFiltros.dataFim ||
    localFiltros.doador;

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

        {/* Busca por Doador */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Doador
          </label>
          <SearchInput
            value={localFiltros.doador || ""}
            onChange={(e) => handleChange("doador", e.target.value)}
            placeholder="Nome do doador..."
          />
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
