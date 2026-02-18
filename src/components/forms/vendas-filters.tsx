"use client";

import { useState, useEffect } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import type { FiltrosVenda } from "@/types/venda";
import type { CategoriaVenda } from "@/types/venda";
import { X } from "lucide-react";

interface VendasFiltersProps {
  categorias: CategoriaVenda[];
  filtros: FiltrosVenda;
  onFiltrosChange: (filtros: FiltrosVenda) => void;
}

export function VendasFilters({
  categorias,
  filtros,
  onFiltrosChange,
}: VendasFiltersProps) {
  const [localFiltros, setLocalFiltros] = useState<FiltrosVenda>(filtros);

  useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros]);

  const handleChange = (key: keyof FiltrosVenda, value: string) => {
    const newFiltros = { ...localFiltros, [key]: value || undefined };
    setLocalFiltros(newFiltros);
    onFiltrosChange(newFiltros);
  };

  const handleClear = () => {
    const emptyFiltros: FiltrosVenda = {};
    setLocalFiltros(emptyFiltros);
    onFiltrosChange(emptyFiltros);
  };

  const hasActiveFilters =
    localFiltros.categoriaId ||
    localFiltros.dataInicio ||
    localFiltros.dataFim ||
    localFiltros.busca;

  const categoriasAtivas = categorias.filter((c) => c.ativo);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={localFiltros.categoriaId || ""}
            onChange={(e) => handleChange("categoriaId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas</option>
            {categoriasAtivas.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
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
