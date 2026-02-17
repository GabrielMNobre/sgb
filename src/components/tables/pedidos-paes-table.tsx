"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { PedidoPaesComCliente } from "@/types/paes";
import { Pencil, Trash2, CheckCircle, XCircle, DollarSign, Wheat } from "lucide-react";

interface PedidosPaesTableProps {
  pedidos: PedidoPaesComCliente[];
  onMarcarPago?: (id: string) => void;
  onMarcarEntregue?: (id: string) => void;
  onMarcarNaoEntregue?: (id: string) => void;
  onEdit?: (pedido: PedidoPaesComCliente) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function PedidosPaesTable({
  pedidos,
  onMarcarPago,
  onMarcarEntregue,
  onMarcarNaoEntregue,
  onEdit,
  onDelete,
  showActions = true,
}: PedidosPaesTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (pedidos.length === 0) {
    return (
      <EmptyState
        icon={Wheat}
        title="Nenhum pedido encontrado"
        description="Crie um novo pedido para começar."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showActions && <TableHead className="w-[80px]">Entrega</TableHead>}
          <TableHead>Cliente</TableHead>
          <TableHead className="text-center">Qtd</TableHead>
          <TableHead className="hidden sm:table-cell text-right">Valor</TableHead>
          <TableHead className="hidden md:table-cell text-right">Crédito</TableHead>
          <TableHead className="text-center">Pago</TableHead>
          <TableHead className="text-center">Status</TableHead>
          {showActions && <TableHead className="text-right">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {pedidos.map((pedido) => (
          <TableRow key={pedido.id}>
            {showActions && (
              <TableCell>
                <div className="flex gap-1">
                  {pedido.statusEntrega === "pendente" && onMarcarEntregue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarcarEntregue(pedido.id)}
                      title="Marcar como entregue"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  {pedido.statusEntrega === "pendente" && onMarcarNaoEntregue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarcarNaoEntregue(pedido.id)}
                      title="Marcar como não entregue"
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
            <TableCell className="font-medium">
              {pedido.cliente?.nome || "—"}
            </TableCell>
            <TableCell className="text-center">{pedido.quantidade}</TableCell>
            <TableCell className="hidden sm:table-cell text-right whitespace-nowrap">
              {formatCurrency(pedido.valorTotal)}
            </TableCell>
            <TableCell className="hidden md:table-cell text-right whitespace-nowrap">
              {pedido.creditoAplicado > 0 ? formatCurrency(pedido.creditoAplicado) : "—"}
            </TableCell>
            <TableCell className="text-center">
              {showActions && onMarcarPago ? (
                <button
                  type="button"
                  onClick={() => onMarcarPago(pedido.id)}
                  title={pedido.statusPagamento === "pago" ? "Desmarcar pagamento" : "Marcar como pago"}
                >
                  <Badge
                    variant={pedido.statusPagamento === "pago" ? "success" : "warning"}
                    className="cursor-pointer hover:opacity-80"
                  >
                    {pedido.statusPagamento === "pago" ? "Pago" : "Pendente"}
                  </Badge>
                </button>
              ) : (
                <Badge variant={pedido.statusPagamento === "pago" ? "success" : "warning"}>
                  {pedido.statusPagamento === "pago" ? "Pago" : "Pendente"}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-center">
              <Badge
                variant={
                  pedido.statusEntrega === "entregue"
                    ? "success"
                    : pedido.statusEntrega === "nao_entregue"
                    ? "error"
                    : "default"
                }
              >
                {pedido.statusEntrega === "entregue"
                  ? "Entregue"
                  : pedido.statusEntrega === "nao_entregue"
                  ? "Não Entregue"
                  : "Pendente"}
              </Badge>
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex justify-end gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(pedido)}
                      title="Editar pedido"
                    >
                      <Pencil className="h-4 w-4 text-gray-600" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(pedido.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Excluir pedido"
                    >
                      <Trash2 className="h-4 w-4" />
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
