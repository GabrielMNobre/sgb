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
import type { GastoComEvento } from "@/types/gasto";
import { Pencil, Trash2, ShoppingCart } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

interface GastosTableProps {
  gastos: GastoComEvento[];
  onEdit: (gasto: GastoComEvento) => void;
  onDelete: (id: string) => void;
}

export function GastosTable({ gastos, onEdit, onDelete }: GastosTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (gastos.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Nenhum gasto encontrado"
        description="Registre gastos para acompanhar suas despesas."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">Data</TableHead>
          <TableHead className="hidden md:table-cell">Evento</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gastos.map((gasto) => (
          <TableRow key={gasto.id}>
            <TableCell className="hidden sm:table-cell whitespace-nowrap">
              {formatDate(gasto.data)}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant="info">{gasto.evento?.nome || "Sem evento"}</Badge>
            </TableCell>
            <TableCell className="min-w-[150px]">
              <div>
                <div className="font-medium">{gasto.descricao}</div>
                <div className="text-xs text-gray-500 mt-1 sm:hidden">
                  {formatDate(gasto.data)}
                </div>
                {gasto.observacao && (
                  <div className="text-sm text-gray-500 mt-1">
                    {gasto.observacao}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="font-semibold text-gray-900 whitespace-nowrap">
              {formatCurrency(gasto.valor)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(gasto)}
                  title="Editar gasto"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(gasto.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Excluir gasto"
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
