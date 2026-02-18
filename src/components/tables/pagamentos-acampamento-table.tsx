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
import { EmptyState } from "@/components/ui/empty-state";
import type { PagamentoComParticipante } from "@/types/acampamento";
import { Trash2, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

interface PagamentosAcampamentoTableProps {
  pagamentos: PagamentoComParticipante[];
  onDelete?: (id: string) => void;
  isFinalizado?: boolean;
}

export function PagamentosAcampamentoTable({
  pagamentos,
  onDelete,
  isFinalizado,
}: PagamentosAcampamentoTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (pagamentos.length === 0) {
    return (
      <EmptyState
        icon={DollarSign}
        title="Nenhum pagamento encontrado"
        description="Registre pagamentos para acompanhar a arrecadação do acampamento."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">Data</TableHead>
          <TableHead>Participante</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead className="hidden md:table-cell">Observação</TableHead>
          {!isFinalizado && onDelete && (
            <TableHead className="text-right">Ações</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {pagamentos.map((pagamento) => (
          <TableRow key={pagamento.id}>
            <TableCell className="hidden sm:table-cell whitespace-nowrap">
              {formatDate(pagamento.data)}
            </TableCell>
            <TableCell className="min-w-[120px]">
              <div>
                <div className="font-medium truncate max-w-[120px] sm:max-w-none">
                  {pagamento.participante?.membro?.nome || "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1 sm:hidden">
                  {formatDate(pagamento.data)}
                </div>
              </div>
            </TableCell>
            <TableCell className="font-semibold text-gray-900 whitespace-nowrap">
              {formatCurrency(pagamento.valor)}
            </TableCell>
            <TableCell className="hidden md:table-cell truncate max-w-[200px]">
              {pagamento.observacao || "—"}
            </TableCell>
            {!isFinalizado && onDelete && (
              <TableCell>
                <div className="flex justify-end gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(pagamento.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Excluir pagamento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
