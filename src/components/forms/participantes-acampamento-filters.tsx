"use client";

import { useState, useEffect } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import type { FiltrosParticipante } from "@/types/acampamento";
import { X } from "lucide-react";

interface ParticipantesAcampamentoFiltersProps {
  filtros: FiltrosParticipante;
  onFiltrosChange: (filtros: FiltrosParticipante) => void;
}

export function ParticipantesAcampamentoFilters({
  filtros,
  onFiltrosChange,
}: ParticipantesAcampamentoFiltersProps) {
  const [localFiltros, setLocalFiltros] = useState<FiltrosParticipante>(filtros);

  useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros]);

  const handleChange = (key: keyof FiltrosParticipante, value: string) => {
    const newFiltros = { ...localFiltros, [key]: value || undefined };
    setLocalFiltros(newFiltros);
    onFiltrosChange(newFiltros);
  };

  const handleClear = () => {
    const emptyFiltros: FiltrosParticipante = {};
    setLocalFiltros(emptyFiltros);
    onFiltrosChange(emptyFiltros);
  };

  const hasActiveFilters =
    localFiltros.busca ||
    localFiltros.status ||
    localFiltros.situacaoPagamento ||
    localFiltros.autorizacao;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Busca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <SearchInput
            value={localFiltros.busca || ""}
            onChange={(e) => handleChange("busca", e.target.value)}
            placeholder="Buscar participante..."
          />
        </div>

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
            <option value="inscrito">Inscritos</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>

        {/* Situação Pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Situação Pagamento
          </label>
          <select
            value={localFiltros.situacaoPagamento || ""}
            onChange={(e) => handleChange("situacaoPagamento", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            <option value="em_dia">Em dia</option>
            <option value="pendente">Pendente</option>
            <option value="sem_pagamento">Sem pagamento</option>
          </select>
        </div>

        {/* Autorização */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Autorização
          </label>
          <select
            value={localFiltros.autorizacao || ""}
            onChange={(e) => handleChange("autorizacao", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="recolhida">Recolhida</option>
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
