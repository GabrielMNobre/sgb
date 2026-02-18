"use client";

import { Eye, Edit, Play, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/date";
import type { Encontro, StatusEncontro } from "@/types/encontro";
import { Calendar } from "lucide-react";

interface EncontrosTableProps {
  encontros: Encontro[];
  onView: (id: string) => void;
  onEdit?: (encontro: Encontro) => void;
  onStart?: (id: string) => void;
  onFinish?: (id: string) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

const statusConfig: Record<
  StatusEncontro,
  { label: string; variant: "default" | "warning" | "success" }
> = {
  agendado: { label: "Agendado", variant: "default" },
  em_andamento: { label: "Em Andamento", variant: "warning" },
  finalizado: { label: "Finalizado", variant: "success" },
};

export function EncontrosTable({
  encontros,
  onView,
  onEdit,
  onStart,
  onFinish,
  onDelete,
  readOnly = false,
}: EncontrosTableProps) {
  if (encontros.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nenhum encontro encontrado"
        description="Ajuste os filtros ou crie um novo encontro"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead className="hidden sm:table-cell">Descrição</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {encontros.map((encontro) => {
          const config = statusConfig[encontro.status];
          return (
            <TableRow key={encontro.id}>
              <TableCell className="font-medium whitespace-nowrap">
                {formatDate(encontro.data)}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <span className="truncate max-w-[200px] block text-gray-500">
                  {encontro.descricao || "—"}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={config.variant}>{config.label}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(encontro.id)}
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {!readOnly && (
                    <>
                      {encontro.status !== "finalizado" && onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(encontro)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      {encontro.status === "agendado" && onStart && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStart(encontro.id)}
                          title="Iniciar encontro"
                        >
                          <Play className="h-4 w-4 text-amber-600" />
                        </Button>
                      )}

                      {encontro.status === "em_andamento" && onFinish && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFinish(encontro.id)}
                          title="Finalizar encontro"
                        >
                          <CheckCheck className="h-4 w-4 text-green-600" />
                        </Button>
                      )}

                      {encontro.status === "agendado" && onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(encontro.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
