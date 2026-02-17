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
import type { EventoComGastos } from "@/types/evento";
import { Pencil, Eye, ToggleLeft, ToggleRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

interface EventosTableProps {
  eventos: EventoComGastos[];
  basePath: string; // "/tesoureiro/gastos/eventos" ou "/admin/financeiro/gastos/eventos"
  onEdit: (evento: EventoComGastos) => void;
  onToggleAtivo: (id: string) => void;
}

export function EventosTable({
  eventos,
  basePath,
  onEdit,
  onToggleAtivo,
}: EventosTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (eventos.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nenhum evento encontrado"
        description="Crie um novo evento para começar a registrar gastos."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead className="hidden md:table-cell">Data</TableHead>
          <TableHead>Total Gasto</TableHead>
          <TableHead className="hidden sm:table-cell text-center">Qtd. Gastos</TableHead>
          <TableHead className="hidden lg:table-cell">Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {eventos.map((evento) => (
          <TableRow key={evento.id}>
            <TableCell className="font-medium min-w-[150px]">{evento.nome}</TableCell>
            <TableCell className="hidden md:table-cell whitespace-nowrap">
              {formatDate(evento.data)}
            </TableCell>
            <TableCell className="font-semibold text-gray-900 whitespace-nowrap">
              {formatCurrency(evento.totalGasto)}
            </TableCell>
            <TableCell className="hidden sm:table-cell text-center">
              {evento.quantidadeGastos}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <Badge variant={evento.ativo ? "success" : "secondary"}>
                {evento.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Link href={`${basePath}/${evento.id}`}>
                  <Button variant="ghost" size="sm" title="Ver detalhes">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(evento)}
                  title="Editar evento"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleAtivo(evento.id)}
                  className={
                    evento.ativo
                      ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      : "text-green-600 hover:text-green-700 hover:bg-green-50"
                  }
                  title={evento.ativo ? "Desativar" : "Ativar"}
                >
                  {evento.ativo ? (
                    <ToggleRight className="h-4 w-4" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
