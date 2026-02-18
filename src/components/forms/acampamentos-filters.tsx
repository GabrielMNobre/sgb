"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { FiltrosAcampamento, StatusAcampamento } from "@/types/acampamento";
import { X } from "lucide-react";

interface AcampamentosFiltersProps {
  filtros: FiltrosAcampamento;
  onFiltrosChange: (filtros: FiltrosAcampamento) => void;
}

export function AcampamentosFilters({
  filtros,
  onFiltrosChange,
}: AcampamentosFiltersProps) {
  const [localFiltros, setLocalFiltros] = useState<FiltrosAcampamento>(filtros);

  useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleChange = (key: keyof FiltrosAcampamento, value: string) => {
    const newFiltros = {
      ...localFiltros,
      [key]: key === "ano" ? (value ? Number(value) : undefined) : (value || undefined),
    };
    setLocalFiltros(newFiltros);
    onFiltrosChange(newFiltros);
  };

  const handleClear = () => {
    const emptyFiltros: FiltrosAcampamento = {};
    setLocalFiltros(emptyFiltros);
    onFiltrosChange(emptyFiltros);
  };

  const hasActiveFilters = localFiltros.status || localFiltros.ano;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFiltros.status || ""}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            <option value="aberto">Abertos</option>
            <option value="finalizado">Finalizados</option>
          </select>
        </div>

        {/* Ano */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ano
          </label>
          <select
            value={localFiltros.ano || ""}
            onChange={(e) => handleChange("ano", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
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
