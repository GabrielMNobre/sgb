"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { SemanaPaesComResumo } from "@/types/paes";
import { Eye, CalendarDays } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

interface SemanasPaesTableProps {
  semanas: SemanaPaesComResumo[];
  basePath: string;
}

export function SemanasPaesTable({ semanas, basePath }: SemanasPaesTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (semanas.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nenhuma semana encontrada"
        description="Crie uma nova semana de produção."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Entrega</TableHead>
          <TableHead className="hidden sm:table-cell text-center">Pedidos</TableHead>
          <TableHead className="text-center">Pães</TableHead>
          <TableHead className="hidden md:table-cell text-center">Fornadas</TableHead>
          <TableHead className="hidden sm:table-cell text-right">Arrecadado</TableHead>
          <TableHead className="hidden sm:table-cell text-right">Pendente</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {semanas.map((semana) => (
          <TableRow key={semana.id}>
            <TableCell className="font-medium whitespace-nowrap">
              {formatDate(semana.dataEntrega)}
            </TableCell>
            <TableCell className="hidden sm:table-cell text-center">{semana.totalPedidos}</TableCell>
            <TableCell className="text-center">{semana.totalPaes}</TableCell>
            <TableCell className="hidden md:table-cell text-center">{semana.fornadas}</TableCell>
            <TableCell className="hidden sm:table-cell text-right whitespace-nowrap">
              {formatCurrency(semana.totalPago)}
            </TableCell>
            <TableCell className="hidden sm:table-cell text-right whitespace-nowrap">
              {semana.totalValor - semana.totalPago > 0 ? (
                <span className="text-amber-600">{formatCurrency(semana.totalValor - semana.totalPago)}</span>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>
              <Badge variant={semana.status === "aberta" ? "info" : "secondary"}>
                {semana.status === "aberta" ? "Aberta" : "Finalizada"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1 sm:gap-2">
                <Link href={`${basePath}/${semana.id}`}>
                  <Button variant="ghost" size="sm" title="Ver detalhes">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
