"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { PedidoRecorrentePaesComCliente } from "@/types/paes";
import { XCircle, Repeat } from "lucide-react";

interface PedidosRecorrentesPaesTableProps {
  pedidos: PedidoRecorrentePaesComCliente[];
  onCancelar?: (id: string) => void;
}

export function PedidosRecorrentesPaesTable({
  pedidos,
  onCancelar,
}: PedidosRecorrentesPaesTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (pedidos.length === 0) {
    return (
      <EmptyState
        icon={Repeat}
        title="Nenhum pedido recorrente"
        description="Crie um pedido recorrente para gerar pedidos automaticamente."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead className="text-center">Qtd/Semana</TableHead>
          <TableHead className="hidden sm:table-cell text-center">Restantes</TableHead>
          <TableHead className="hidden md:table-cell text-right">Valor Total</TableHead>
          <TableHead>Status</TableHead>
          {onCancelar && <TableHead className="text-right">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {pedidos.map((pedido) => (
          <TableRow key={pedido.id}>
            <TableCell className="font-medium">{pedido.cliente?.nome || "—"}</TableCell>
            <TableCell className="text-center">{pedido.quantidadePaes}</TableCell>
            <TableCell className="hidden sm:table-cell text-center">
              {pedido.semanasRestantes}/{pedido.quantidadeSemanas}
            </TableCell>
            <TableCell className="hidden md:table-cell text-right whitespace-nowrap">
              {formatCurrency(pedido.valorTotal)}
            </TableCell>
            <TableCell>
              <Badge variant={pedido.ativo && pedido.semanasRestantes > 0 ? "success" : "secondary"}>
                {pedido.ativo && pedido.semanasRestantes > 0 ? "Ativo" : "Encerrado"}
              </Badge>
            </TableCell>
            {onCancelar && (
              <TableCell>
                <div className="flex justify-end">
                  {pedido.ativo && pedido.semanasRestantes > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancelar(pedido.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Cancelar recorrente"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
