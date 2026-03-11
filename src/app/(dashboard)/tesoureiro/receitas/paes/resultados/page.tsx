"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingUp, Wheat } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import type { ResultadosGeraisPaes } from "@/types/paes";

export default function ResultadosPage() {
  const [resultados, setResultados] = useState<ResultadosGeraisPaes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/paes/resultados");
      if (res.ok) {
        const data = await res.json();
        setResultados(data);
      }
    } catch (error) {
      console.error("Erro ao carregar resultados:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loading size="lg" />
        <p className="text-gray-500 mt-3">Carregando...</p>
      </div>
    );
  }

  if (!resultados || resultados.semanas.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Resultados</h1>
          <p className="text-sm text-gray-600 mt-1">Visão geral das vendas de pães</p>
        </div>
        <Card>
          <div className="p-6">
            <EmptyState
              icon={Wheat}
              title="Nenhum resultado ainda"
              description="Crie semanas e registre pedidos para ver os resultados."
            />
          </div>
        </Card>
      </div>
    );
  }

  const margemLucro =
    resultados.totalArrecadado > 0
      ? (resultados.lucroTotal / resultados.totalArrecadado) * 100
      : 0;

  const ticketMedio =
    resultados.totalPedidos > 0
      ? resultados.totalArrecadado / resultados.totalPedidos
      : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Resultados</h1>
        <p className="text-sm text-gray-600 mt-1">
          Visão geral das vendas de pães · {resultados.semanas.length} semanas
        </p>
      </div>

      {/* Cards gerais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-5">
            <p className="text-sm text-gray-600">Total Arrecadado</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(resultados.totalArrecadado)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-gray-600">Custo Total</p>
            <p className="text-2xl font-bold text-red-500 mt-1">
              {formatCurrency(resultados.custoTotal)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-gray-600">Lucro Total</p>
            <p className={`text-2xl font-bold mt-1 ${resultados.lucroTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(resultados.lucroTotal)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-gray-600">Pendente</p>
            <p className={`text-2xl font-bold mt-1 ${resultados.totalPendente > 0 ? "text-amber-600" : "text-gray-400"}`}>
              {formatCurrency(resultados.totalPendente)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-gray-600">Total Pães</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{resultados.totalPaes}</p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-gray-600">Total Pedidos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{resultados.totalPedidos}</p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-gray-600">Fornadas</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{resultados.totalFornadas}</p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-gray-600">Margem / Ticket Médio</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {margemLucro.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400">{formatCurrency(ticketMedio)} / pedido</p>
          </div>
        </Card>
      </div>

      {/* Tabela por semana */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            Resultado por Semana
          </h2>

          {/* Mobile: cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {resultados.semanas.map((semana) => (
              <div key={semana.semanaId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      Entrega: {formatDate(semana.dataEntrega)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Produção: {formatDate(semana.dataProducao)}
                    </p>
                  </div>
                  <Badge variant={semana.status === "aberta" ? "success" : "secondary"}>
                    {semana.status === "aberta" ? "Aberta" : "Finalizada"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Pães</p>
                    <p className="font-medium">{semana.totalPaes}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pedidos</p>
                    <p className="font-medium">{semana.totalPedidos}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Arrecadado</p>
                    <p className="font-medium text-green-600">{formatCurrency(semana.totalPago)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pendente</p>
                    <p className={`font-medium ${semana.totalPendente > 0 ? "text-amber-600" : "text-gray-400"}`}>
                      {formatCurrency(semana.totalPendente)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Custo</p>
                    <p className="font-medium text-red-500">{formatCurrency(semana.custoProducao)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lucro</p>
                    <p className={`font-medium ${semana.lucro >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(semana.lucro)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Entrega</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Status</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">Pães</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">Pedidos</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">Arrecadado</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">Pendente</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">Custo</th>
                  <th className="text-right py-2 font-medium text-gray-600">Lucro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resultados.semanas.map((semana) => (
                  <tr key={semana.semanaId} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-900">{formatDate(semana.dataEntrega)}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={semana.status === "aberta" ? "success" : "secondary"}>
                        {semana.status === "aberta" ? "Aberta" : "Finalizada"}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-900">{semana.totalPaes}</td>
                    <td className="py-2 pr-4 text-right text-gray-900">{semana.totalPedidos}</td>
                    <td className="py-2 pr-4 text-right font-medium text-green-600">
                      {formatCurrency(semana.totalPago)}
                    </td>
                    <td className={`py-2 pr-4 text-right font-medium ${semana.totalPendente > 0 ? "text-amber-600" : "text-gray-400"}`}>
                      {formatCurrency(semana.totalPendente)}
                    </td>
                    <td className="py-2 pr-4 text-right text-red-500">
                      {formatCurrency(semana.custoProducao)}
                    </td>
                    <td className={`py-2 text-right font-semibold ${semana.lucro >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(semana.lucro)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-2 pr-4 font-semibold text-gray-900">Total</td>
                  <td className="py-2 pr-4"></td>
                  <td className="py-2 pr-4 text-right font-semibold">{resultados.totalPaes}</td>
                  <td className="py-2 pr-4 text-right font-semibold">{resultados.totalPedidos}</td>
                  <td className="py-2 pr-4 text-right font-semibold text-green-600">
                    {formatCurrency(resultados.totalArrecadado)}
                  </td>
                  <td className={`py-2 pr-4 text-right font-semibold ${resultados.totalPendente > 0 ? "text-amber-600" : "text-gray-400"}`}>
                    {formatCurrency(resultados.totalPendente)}
                  </td>
                  <td className="py-2 pr-4 text-right font-semibold text-red-500">
                    {formatCurrency(resultados.custoTotal)}
                  </td>
                  <td className={`py-2 text-right font-bold ${resultados.lucroTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(resultados.lucroTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
