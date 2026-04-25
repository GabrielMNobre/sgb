"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronDown, ChevronRight, AlertCircle, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import type { InadimplentePaes } from "@/types/paes";
import { marcarPagoPaesAction } from "../actions";

export default function InadimplentesPage() {
  const [inadimplentes, setInadimplentes] = useState<InadimplentePaes[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/paes/inadimplentes");
      if (res.ok) {
        const data = await res.json();
        setInadimplentes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar inadimplentes:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandido = (clienteId: string) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(clienteId)) next.delete(clienteId);
      else next.add(clienteId);
      return next;
    });
  };

  const handleMarcarPago = async (pedidoId: string) => {
    await marcarPagoPaesAction(pedidoId);
    await carregarDados();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const totalGeral = inadimplentes.reduce((sum, c) => sum + c.totalPendente, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Em Aberto</h1>
          <p className="text-sm text-gray-600 mt-1">
            Clientes com pagamentos pendentes de pães
          </p>
        </div>
        {inadimplentes.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-right">
            <p className="text-xs text-amber-600">Total em aberto</p>
            <p className="text-xl font-bold text-amber-700">{formatCurrency(totalGeral)}</p>
          </div>
        )}
      </div>

      {/* Resumo */}
      {inadimplentes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Clientes devedores</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{inadimplentes.length}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Total pendente</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(totalGeral)}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Pedidos em aberto</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {inadimplentes.reduce((sum, c) => sum + c.pedidos.length, 0)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Lista */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loading size="lg" />
              <p className="text-gray-500 mt-3">Carregando...</p>
            </div>
          ) : inadimplentes.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="Nenhum inadimplente"
              description="Todos os clientes estão com os pagamentos em dia."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {inadimplentes.map((cliente) => {
                const isExpandido = expandidos.has(cliente.clienteId);
                return (
                  <div key={cliente.clienteId} className="py-3">
                    {/* Linha do cliente */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-4 text-left hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                      onClick={() => toggleExpandido(cliente.clienteId)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isExpandido ? (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{cliente.clienteNome}</p>
                          <p className="text-sm text-gray-500">
                            {cliente.pedidos.length} {cliente.pedidos.length === 1 ? "pedido" : "pedidos"} · {cliente.totalPaes} pães
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <Badge variant="warning">{formatCurrency(cliente.totalPendente)}</Badge>
                      </div>
                    </button>

                    {/* Pedidos expandidos */}
                    {isExpandido && (
                      <div className="mt-2 ml-7 space-y-2">
                        {cliente.pedidos.map((pedido) => (
                          <div
                            key={pedido.pedidoId}
                            className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-700">
                                {pedido.dataEntrega
                                  ? `Entrega: ${formatDate(pedido.dataEntrega)}`
                                  : "Data não definida"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {pedido.quantidade} pães · {formatCurrency(pedido.valorTotal)}
                                {pedido.valorPago > 0 && (
                                  <span className="text-green-600"> (pago: {formatCurrency(pedido.valorPago)})</span>
                                )}
                              </p>
                              {pedido.statusSemana && (
                                <Badge
                                  variant={pedido.statusSemana === "aberta" ? "success" : "secondary"}
                                  className="mt-1 text-xs"
                                >
                                  Semana {pedido.statusSemana === "aberta" ? "aberta" : "finalizada"}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <p className="text-sm font-semibold text-amber-700">
                                {formatCurrency(pedido.valorPendente)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarcarPago(pedido.pedidoId)}
                                title="Marcar como pago"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <DollarSign className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
