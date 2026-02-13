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
import type { VendaComCategoria } from "@/types/venda";
import { Pencil, Trash2, ShoppingBag } from "lucide-react";

interface VendasTableProps {
  vendas: VendaComCategoria[];
  onEdit: (venda: VendaComCategoria) => void;
  onDelete: (id: string) => void;
}

export function VendasTable({ vendas, onEdit, onDelete }: VendasTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("pt-BR").format(new Date(date));

  if (vendas.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nenhuma venda encontrada"
        description="Registre vendas para acompanhar suas receitas."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">Data</TableHead>
          <TableHead className="hidden lg:table-cell">Categoria</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="hidden md:table-cell text-center">Qtd</TableHead>
          <TableHead className="hidden md:table-cell text-right">Valor Unit.</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendas.map((venda) => (
          <TableRow key={venda.id}>
            <TableCell className="hidden sm:table-cell whitespace-nowrap">
              {formatDate(venda.data)}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {venda.categoria ? (
                <Badge variant="info">
                  {venda.categoria.nome}
                </Badge>
              ) : (
                <Badge variant="secondary">Sem categoria</Badge>
              )}
            </TableCell>
            <TableCell className="min-w-[150px]">
              <div>
                <div className="font-medium">{venda.descricao}</div>
                <div className="text-xs text-gray-500 mt-1 sm:hidden">
                  {formatDate(venda.data)}
                </div>
                <div className="text-xs text-gray-500 mt-1 lg:hidden">
                  {venda.categoria?.nome || "Sem categoria"}
                </div>
                <div className="text-xs text-gray-500 mt-1 md:hidden">
                  {venda.quantidade}x {formatCurrency(venda.valorUnitario)}
                </div>
                {venda.observacao && (
                  <div className="text-sm text-gray-500 mt-1">
                    {venda.observacao}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell text-center">
              {venda.quantidade}
            </TableCell>
            <TableCell className="hidden md:table-cell text-right whitespace-nowrap">
              {formatCurrency(venda.valorUnitario)}
            </TableCell>
            <TableCell className="font-semibold text-gray-900 text-right whitespace-nowrap">
              {formatCurrency(venda.valorTotal)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(venda)}
                  title="Editar venda"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(venda.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Excluir venda"
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
