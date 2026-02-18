"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Acampamento } from "@/types/acampamento";
import { Eye, Pencil, Trash2, Tent } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

interface AcampamentosTableProps {
  acampamentos: Acampamento[];
  onEdit: (acampamento: Acampamento) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function AcampamentosTable({
  acampamentos,
  onEdit,
  onDelete,
  onView,
}: AcampamentosTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (acampamentos.length === 0) {
    return (
      <EmptyState
        icon={Tent}
        title="Nenhum acampamento encontrado"
        description="Crie um acampamento para começar a gerenciar participantes e pagamentos."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead className="hidden sm:table-cell">Período</TableHead>
          <TableHead className="hidden md:table-cell">Valor</TableHead>
          <TableHead className="hidden sm:table-cell">Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {acampamentos.map((acampamento) => (
          <TableRow key={acampamento.id}>
            <TableCell className="min-w-[120px]">
              <div>
                <div className="font-medium truncate max-w-[120px] sm:max-w-none">{acampamento.nome}</div>
                <div className="text-xs text-gray-500 mt-1 sm:hidden">
                  {formatDate(acampamento.dataInicio)} - {formatDate(acampamento.dataFim)}
                </div>
                <div className="text-xs text-gray-500 mt-1 sm:hidden">
                  <Badge
                    variant={acampamento.status === "aberto" ? "success" : "secondary"}
                  >
                    {acampamento.status === "aberto" ? "Aberto" : "Finalizado"}
                  </Badge>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell whitespace-nowrap">
              {formatDate(acampamento.dataInicio)} - {formatDate(acampamento.dataFim)}
            </TableCell>
            <TableCell className="hidden md:table-cell whitespace-nowrap">
              {formatCurrency(acampamento.valorPorPessoa)}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge
                variant={acampamento.status === "aberto" ? "success" : "secondary"}
              >
                {acampamento.status === "aberto" ? "Aberto" : "Finalizado"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(acampamento.id)}
                  title="Ver acampamento"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {acampamento.status === "aberto" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(acampamento)}
                      title="Editar acampamento"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(acampamento.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Excluir acampamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
