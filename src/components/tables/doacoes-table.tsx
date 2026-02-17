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
import type { Doacao } from "@/types/doacao";
import { Pencil, Trash2, Heart } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

interface DoacoesTableProps {
  doacoes: Doacao[];
  onEdit: (doacao: Doacao) => void;
  onDelete: (id: string) => void;
}

export function DoacoesTable({ doacoes, onEdit, onDelete }: DoacoesTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (doacoes.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Nenhuma doação encontrada"
        description="Registre doações para acompanhar suas receitas."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">Data</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead className="hidden md:table-cell">Doador</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {doacoes.map((doacao) => (
          <TableRow key={doacao.id}>
            <TableCell className="hidden sm:table-cell whitespace-nowrap">
              {formatDate(doacao.data)}
            </TableCell>
            <TableCell className="font-semibold text-green-600 whitespace-nowrap">
              {formatCurrency(doacao.valor)}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {doacao.doador || (
                <span className="text-gray-400 italic">Anônimo</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <div className="md:hidden text-xs text-gray-500 mr-2">
                  {doacao.doador || "Anônimo"}
                  <div className="sm:hidden">{formatDate(doacao.data)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(doacao)}
                  title="Editar doação"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(doacao.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Excluir doação"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
