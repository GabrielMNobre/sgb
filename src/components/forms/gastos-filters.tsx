"use client";

import { useState, useEffect } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import type { FiltrosGasto } from "@/types/gasto";
import type { Evento } from "@/types/evento";
import { X } from "lucide-react";

interface GastosFiltersProps {
  eventos: Evento[];
  filtros: FiltrosGasto;
  onFiltrosChange: (filtros: FiltrosGasto) => void;
}

export function GastosFilters({
  eventos,
  filtros,
  onFiltrosChange,
}: GastosFiltersProps) {
  const [localFiltros, setLocalFiltros] = useState<FiltrosGasto>(filtros);

  useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros]);

  const handleChange = (key: keyof FiltrosGasto, value: string) => {
    const newFiltros = { ...localFiltros, [key]: value || undefined };
    setLocalFiltros(newFiltros);
    onFiltrosChange(newFiltros);
  };

  const handleClear = () => {
    const emptyFiltros: FiltrosGasto = {};
    setLocalFiltros(emptyFiltros);
    onFiltrosChange(emptyFiltros);
  };

  const hasActiveFilters =
    localFiltros.eventoId ||
    localFiltros.dataInicio ||
    localFiltros.dataFim ||
    localFiltros.busca;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Evento
          </label>
          <select
            value={localFiltros.eventoId || ""}
            onChange={(e) => handleChange("eventoId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            {eventos.map((evento) => (
              <option key={evento.id} value={evento.id}>
                {evento.nome}
              </option>
            ))}
          </select>
        </div>

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

        {/* Busca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <SearchInput
            value={localFiltros.busca || ""}
            onChange={(e) => handleChange("busca", e.target.value)}
            placeholder="Buscar por descrição..."
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
