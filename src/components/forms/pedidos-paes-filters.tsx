"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { FiltrosPedidoPaes, ClientePaes, SemanaPaes } from "@/types/paes";

interface PedidosPaesFiltersProps {
  clientes: ClientePaes[];
  semanas: SemanaPaes[];
  filtros: FiltrosPedidoPaes;
  onFiltrosChange: (filtros: FiltrosPedidoPaes) => void;
}

export function PedidosPaesFilters({
  clientes,
  semanas,
  filtros,
  onFiltrosChange,
}: PedidosPaesFiltersProps) {
  const [localFiltros, setLocalFiltros] = useState<FiltrosPedidoPaes>(filtros);

  useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros]);

  const handleChange = (key: keyof FiltrosPedidoPaes, value: string) => {
    const newFiltros = { ...localFiltros, [key]: value || undefined };
    setLocalFiltros(newFiltros);
    onFiltrosChange(newFiltros);
  };

  const handleClear = () => {
    const emptyFiltros: FiltrosPedidoPaes = {};
    setLocalFiltros(emptyFiltros);
    onFiltrosChange(emptyFiltros);
  };

  const hasActiveFilters =
    localFiltros.semanaId ||
    localFiltros.clienteId ||
    localFiltros.statusPagamento ||
    localFiltros.statusEntrega;

  const clientesAtivos = clientes.filter((c) => c.ativo);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Semana */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semana
          </label>
          <select
            value={localFiltros.semanaId || ""}
            onChange={(e) => handleChange("semanaId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas</option>
            {semanas.map((semana) => (
              <option key={semana.id} value={semana.id}>
                {new Date(semana.dataEntrega).toLocaleDateString("pt-BR")}
              </option>
            ))}
          </select>
        </div>

        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <select
            value={localFiltros.clienteId || ""}
            onChange={(e) => handleChange("clienteId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            {clientesAtivos.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Status Pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pagamento
          </label>
          <select
            value={localFiltros.statusPagamento || ""}
            onChange={(e) => handleChange("statusPagamento", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>

        {/* Status Entrega */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entrega
          </label>
          <select
            value={localFiltros.statusEntrega || ""}
            onChange={(e) => handleChange("statusEntrega", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="entregue">Entregue</option>
            <option value="nao_entregue">Não Entregue</option>
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
