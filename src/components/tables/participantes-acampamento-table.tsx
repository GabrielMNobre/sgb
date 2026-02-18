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
import type { ParticipanteComPagamentos } from "@/types/acampamento";
import { Eye, Trash2, Users } from "lucide-react";

interface ParticipantesAcampamentoTableProps {
  participantes: ParticipanteComPagamentos[];
  onView: (id: string) => void;
  onDelete?: (id: string) => void;
  isFinalizado?: boolean;
}

export function ParticipantesAcampamentoTable({
  participantes,
  onView,
  onDelete,
  isFinalizado,
}: ParticipantesAcampamentoTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (participantes.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum participante encontrado"
        description="Adicione participantes ao acampamento para gerenciar inscrições e pagamentos."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead className="hidden sm:table-cell">Tipo</TableHead>
          <TableHead className="hidden lg:table-cell">Unidade</TableHead>
          <TableHead className="hidden md:table-cell text-right">Valor</TableHead>
          <TableHead className="hidden md:table-cell text-right">Pago</TableHead>
          <TableHead className="hidden sm:table-cell text-right">Pendente</TableHead>
          <TableHead className="hidden sm:table-cell">Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participantes.map((participante) => (
          <TableRow key={participante.id}>
            <TableCell className="min-w-[120px]">
              <div>
                <div className="font-medium truncate max-w-[120px] sm:max-w-none">
                  {participante.membro?.nome || "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1 sm:hidden">
                  {participante.membro?.tipo
                    ? participante.membro.tipo.charAt(0).toUpperCase() +
                      participante.membro.tipo.slice(1)
                    : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1 sm:hidden">
                  <Badge
                    variant={
                      participante.status === "inscrito" ? "success" : "error"
                    }
                  >
                    {participante.status === "inscrito" ? "Inscrito" : "Cancelado"}
                  </Badge>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {participante.membro?.tipo
                ? participante.membro.tipo.charAt(0).toUpperCase() +
                  participante.membro.tipo.slice(1)
                : "—"}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {participante.membro?.unidade?.nome || "—"}
            </TableCell>
            <TableCell className="hidden md:table-cell text-right whitespace-nowrap">
              {participante.isento ? (
                <Badge variant="secondary">Isento</Badge>
              ) : (
                formatCurrency(participante.valorAPagar)
              )}
            </TableCell>
            <TableCell className="hidden md:table-cell text-right whitespace-nowrap">
              {formatCurrency(participante.totalPago)}
            </TableCell>
            <TableCell className="hidden sm:table-cell text-right whitespace-nowrap">
              <span
                className={participante.pendente > 0 ? "text-red-600 font-medium" : ""}
              >
                {formatCurrency(participante.pendente)}
              </span>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge
                variant={
                  participante.status === "inscrito" ? "success" : "error"
                }
              >
                {participante.status === "inscrito" ? "Inscrito" : "Cancelado"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(participante.id)}
                  title="Ver detalhes"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {!isFinalizado && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(participante.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Excluir participante"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
