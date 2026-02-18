"use client";

import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FiltrosEncontro } from "@/types/encontro";

interface EncontrosFiltersProps {
  filtros: FiltrosEncontro;
  onFiltrosChange: (filtros: FiltrosEncontro) => void;
}

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "agendado", label: "Agendados" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "finalizado", label: "Finalizados" },
];

export function EncontrosFilters({
  filtros,
  onFiltrosChange,
}: EncontrosFiltersProps) {
  const hasFilters = filtros.status || filtros.dataInicio || filtros.dataFim;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Select
          value={filtros.status || ""}
          onChange={(e) =>
            onFiltrosChange({
              ...filtros,
              status: e.target.value ? (e.target.value as FiltrosEncontro["status"]) : undefined,
            })
          }
          options={statusOptions}
        />
        <Input
          type="date"
          value={filtros.dataInicio || ""}
          onChange={(e) =>
            onFiltrosChange({
              ...filtros,
              dataInicio: e.target.value || undefined,
            })
          }
          placeholder="Data início"
        />
        <Input
          type="date"
          value={filtros.dataFim || ""}
          onChange={(e) =>
            onFiltrosChange({
              ...filtros,
              dataFim: e.target.value || undefined,
            })
          }
          placeholder="Data fim"
        />
      </div>
      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltrosChange({})}
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
