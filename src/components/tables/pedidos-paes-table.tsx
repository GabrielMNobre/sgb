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

function StatusEntregaBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={
        status === "entregue"
          ? "success"
          : status === "nao_entregue"
          ? "error"
          : "default"
      }
    >
      {status === "entregue"
        ? "Entregue"
        : status === "nao_entregue"
        ? "Não Entregue"
        : "Pendente"}
    </Badge>
  );
}

function StatusPagamentoBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "pago" ? "success" : "warning"}>
      {status === "pago" ? "Pago" : "Pendente"}
    </Badge>
  );
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

  const ordemEntrega: Record<string, number> = { pendente: 0, nao_entregue: 1, entregue: 2 };
  const pedidosOrdenados = [...pedidos].sort(
    (a, b) => (ordemEntrega[a.statusEntrega] ?? 9) - (ordemEntrega[b.statusEntrega] ?? 9)
  );

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
    <>
      {/* Mobile: Card layout */}
      <div className="flex flex-col gap-3 sm:hidden">
        {pedidosOrdenados.map((pedido) => (
          <div key={pedido.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {pedido.cliente?.nome || "—"}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {pedido.quantidade} {pedido.quantidade === 1 ? "pão" : "pães"} · {formatCurrency(pedido.valorTotal)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <StatusEntregaBadge status={pedido.statusEntrega} />
                <StatusPagamentoBadge status={pedido.statusPagamento} />
              </div>
            </div>

            {pedido.creditoAplicado > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Crédito: {formatCurrency(pedido.creditoAplicado)}
              </p>
            )}

            {showActions && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                {pedido.statusEntrega === "pendente" && (onMarcarEntregue || onMarcarNaoEntregue) && (
                  <div className="flex gap-2">
                    {onMarcarEntregue && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarcarEntregue(pedido.id)}
                        className="flex-1 min-h-[44px] text-green-700 border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Entregue
                      </Button>
                    )}
                    {onMarcarNaoEntregue && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarcarNaoEntregue(pedido.id)}
                        className="flex-1 min-h-[44px] text-red-700 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Não Entregue
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  {onMarcarPago && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarcarPago(pedido.id)}
                      className="min-h-[44px] px-3"
                      title={pedido.statusPagamento === "pago" ? "Desmarcar pagamento" : "Marcar como pago"}
                    >
                      <DollarSign className="h-4 w-4 text-gray-600" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(pedido)}
                      className="min-h-[44px] px-3"
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
                      className="min-h-[44px] px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Excluir pedido"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {showActions && <TableHead className="w-[100px]">Entrega</TableHead>}
              <TableHead>Cliente</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="hidden md:table-cell text-right">Crédito</TableHead>
              <TableHead className="text-center">Pago</TableHead>
              <TableHead className="text-center">Status</TableHead>
              {showActions && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidosOrdenados.map((pedido) => (
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
                <TableCell className="text-right whitespace-nowrap">
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
                    <StatusPagamentoBadge status={pedido.statusPagamento} />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <StatusEntregaBadge status={pedido.statusEntrega} />
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex justify-end gap-2">
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
      </div>
    </>
  );
}
