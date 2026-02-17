"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PedidosPaesTable } from "@/components/tables/pedidos-paes-table";
import { CreditosPaesTable } from "@/components/tables/creditos-paes-table";
import { PedidosRecorrentesPaesTable } from "@/components/tables/pedidos-recorrentes-paes-table";
import { ArrowLeft } from "lucide-react";
import type {
  ClientePaes,
  PedidoPaesComCliente,
  CreditoPaes,
  PedidoRecorrentePaesComCliente,
} from "@/types/paes";
import {
  marcarPagoPaesAction,
  marcarEntreguePaesAction,
  cancelarRecorrentePaesAction,
} from "../../actions";

export default function ClientePaesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clienteId = params.clienteId as string;

  const [cliente, setCliente] = useState<ClientePaes | null>(null);
  const [pedidos, setPedidos] = useState<PedidoPaesComCliente[]>([]);
  const [creditos, setCreditos] = useState<CreditoPaes[]>([]);
  const [recorrentes, setRecorrentes] = useState<PedidoRecorrentePaesComCliente[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  useEffect(() => {
    carregarDados();
  }, [clienteId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [clienteRes, pedidosRes, creditosRes, recorrentesRes] = await Promise.all([
        fetch(`/api/paes/clientes/${clienteId}`),
        fetch(`/api/paes/pedidos?clienteId=${clienteId}`),
        fetch(`/api/paes/creditos?clienteId=${clienteId}`),
        fetch(`/api/paes/pedidos-recorrentes`),
      ]);

      if (clienteRes.ok) {
        const clienteData = await clienteRes.json();
        setCliente(clienteData);
      }

      if (pedidosRes.ok) {
        const pedidosData = await pedidosRes.json();
        setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      }

      if (creditosRes.ok) {
        const creditosData = await creditosRes.json();
        setCreditos(Array.isArray(creditosData) ? creditosData : []);
      }

      if (recorrentesRes.ok) {
        const recorrentesData = await recorrentesRes.json();
        setRecorrentes(Array.isArray(recorrentesData) ? recorrentesData : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarPago = async (id: string) => {
    await marcarPagoPaesAction(id);
    await carregarDados();
  };

  const handleMarcarEntregue = async (id: string) => {
    await marcarEntreguePaesAction(id);
    await carregarDados();
  };

  const handleCancelarRecorrente = async (id: string) => {
    await cancelarRecorrentePaesAction(id);
    await carregarDados();
  };

  const recorrentesDoCliente = recorrentes.filter(
    (r) => r.cliente?.id === clienteId
  );

  const totalPedidos = pedidos.length;
  const totalGasto = pedidos.reduce((acc, p) => acc + p.valorTotal, 0);
  const creditosDisponiveis = creditos.reduce(
    (acc, c) => acc + c.quantidadeDisponivel,
    0
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/financeiro/receitas/paes/clientes")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Clientes
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{cliente.nome}</h1>
          <Badge variant={cliente.ativo ? "success" : "secondary"}>
            {cliente.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total Pedidos</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalPedidos}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total Gasto</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {formatCurrency(totalGasto)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Créditos Disponíveis</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {creditosDisponiveis}
            </p>
          </div>
        </Card>
      </div>

      {/* Pedidos */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos</h2>
        <Card>
          <div className="p-6">
            <PedidosPaesTable
              pedidos={pedidos}
              onMarcarPago={handleMarcarPago}
              onMarcarEntregue={handleMarcarEntregue}
            />
          </div>
        </Card>
      </div>

      {/* Créditos */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Créditos</h2>
        <Card>
          <div className="p-6">
            <CreditosPaesTable creditos={creditos} />
          </div>
        </Card>
      </div>

      {/* Pedidos Recorrentes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pedidos Recorrentes
        </h2>
        <Card>
          <div className="p-6">
            <PedidosRecorrentesPaesTable
              pedidos={recorrentesDoCliente}
              onCancelar={handleCancelarRecorrente}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
