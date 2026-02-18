"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PedidosPaesTable } from "@/components/tables/pedidos-paes-table";
import { PedidosPaesFilters } from "@/components/forms/pedidos-paes-filters";
import { PedidoPaesModal } from "@/components/forms/pedido-paes-modal";
import { NaoEntregueModal } from "@/components/forms/nao-entregue-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus } from "lucide-react";
import type {
  PedidoPaesComCliente,
  PedidoPaesFormData,
  ClientePaesFormData,
  FiltrosPedidoPaes,
  ClientePaes,
  SemanaPaes,
  ConfiguracoesPaes,
} from "@/types/paes";
import {
  criarPedidoPaesAction,
  editarPedidoPaesAction,
  excluirPedidoPaesAction,
  marcarPagoPaesAction,
  marcarEntreguePaesAction,
  marcarNaoEntreguePaesAction,
  criarClientePaesAction,
} from "../actions";

export default function PedidosPaesPage() {
  const [pedidos, setPedidos] = useState<PedidoPaesComCliente[]>([]);
  const [clientes, setClientes] = useState<ClientePaes[]>([]);
  const [semanas, setSemanas] = useState<SemanaPaes[]>([]);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesPaes | null>(null);
  const [filtros, setFiltros] = useState<FiltrosPedidoPaes>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [naoEntregueModalOpen, setNaoEntregueModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState<string | null>(null);
  const [pedidoParaNaoEntrega, setPedidoParaNaoEntrega] = useState<PedidoPaesComCliente | null>(null);
  const [pedidoParaEditar, setPedidoParaEditar] = useState<PedidoPaesComCliente | null>(null);

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filtros as any);
      const [pedidosRes, clientesRes, semanasRes, configRes] = await Promise.all([
        fetch(`/api/paes/pedidos?${params}`),
        fetch("/api/paes/clientes"),
        fetch("/api/paes/semanas"),
        fetch("/api/paes/configuracoes"),
      ]);

      if (pedidosRes.ok) {
        const pedidosData = await pedidosRes.json();
        setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      }
      if (clientesRes.ok) {
        const clientesData = await clientesRes.json();
        setClientes(Array.isArray(clientesData) ? clientesData : []);
      }
      if (semanasRes.ok) {
        const semanasData = await semanasRes.json();
        setSemanas(Array.isArray(semanasData) ? semanasData : []);
      }
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfiguracoes(configData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setPedidos([]);
      setClientes([]);
      setSemanas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarCliente = async (data: ClientePaesFormData) => {
    await criarClientePaesAction(data);
    await carregarDados();
  };

  const handleNovoPedido = () => {
    setPedidoParaEditar(null);
    setModalOpen(true);
  };

  const handleEditarPedido = (pedido: PedidoPaesComCliente) => {
    setPedidoParaEditar(pedido);
    setModalOpen(true);
  };

  const handleSalvarPedido = async (data: PedidoPaesFormData, id?: string) => {
    if (id) {
      await editarPedidoPaesAction(id, data);
    } else {
      await criarPedidoPaesAction(data);
    }
    setPedidoParaEditar(null);
    await carregarDados();
  };

  const handleExcluirPedido = (id: string) => {
    setPedidoParaExcluir(id);
    setDeleteDialogOpen(true);
  };

  const confirmarExclusao = async () => {
    if (pedidoParaExcluir) {
      await excluirPedidoPaesAction(pedidoParaExcluir);
      await carregarDados();
    }
    setDeleteDialogOpen(false);
    setPedidoParaExcluir(null);
  };

  const handleMarcarPago = async (id: string) => {
    await marcarPagoPaesAction(id);
    await carregarDados();
  };

  const handleMarcarEntregue = async (id: string) => {
    await marcarEntreguePaesAction(id);
    await carregarDados();
  };

  const handleNaoEntregue = async (pedidoId: string, motivo: string) => {
    await marcarNaoEntreguePaesAction(pedidoId, motivo);
    await carregarDados();
    setNaoEntregueModalOpen(false);
    setPedidoParaNaoEntrega(null);
  };

  const totalPedidos = pedidos.length;
  const totalPaes = pedidos.reduce((sum, p) => sum + p.quantidade, 0);
  const totalValor = pedidos.reduce((sum, p) => sum + p.valorTotal, 0);
  const totalPago = pedidos.reduce((sum, p) => sum + p.valorPago, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerenciamento de pedidos de paes
          </p>
        </div>
        <Button variant="primary" onClick={handleNovoPedido} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total Pedidos</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {totalPedidos}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total Paes</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {totalPaes}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total Valor</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
              {formatCurrency(totalValor)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total Pago</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {formatCurrency(totalPago)}
            </p>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-6">
          <PedidosPaesFilters
            clientes={clientes}
            semanas={semanas}
            filtros={filtros}
            onFiltrosChange={setFiltros}
          />
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <PedidosPaesTable
              pedidos={pedidos}
              onEdit={handleEditarPedido}
              onMarcarPago={handleMarcarPago}
              onMarcarEntregue={handleMarcarEntregue}
              onMarcarNaoEntregue={(id) => {
                const pedido = pedidos.find((p) => p.id === id);
                if (pedido) {
                  setPedidoParaNaoEntrega(pedido);
                  setNaoEntregueModalOpen(true);
                }
              }}
              onDelete={handleExcluirPedido}
            />
          )}
        </div>
      </Card>

      {/* Modal Pedido */}
      <PedidoPaesModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPedidoParaEditar(null);
        }}
        clientes={clientes}
        semanas={semanas}
        valorUnitarioPadrao={configuracoes?.valorUnitarioPadrao || 10}
        onSubmit={handleSalvarPedido}
        onCreateCliente={handleCriarCliente}
        pedidoInicial={pedidoParaEditar ? {
          id: pedidoParaEditar.id,
          clienteId: pedidoParaEditar.clienteId,
          semanaId: pedidoParaEditar.semanaId,
          quantidade: pedidoParaEditar.quantidade,
          valorUnitario: pedidoParaEditar.valorUnitario,
          pago: pedidoParaEditar.statusPagamento === "pago",
        } : undefined}
      />

      {/* Modal Nao Entregue */}
      <NaoEntregueModal
        isOpen={naoEntregueModalOpen}
        onClose={() => {
          setNaoEntregueModalOpen(false);
          setPedidoParaNaoEntrega(null);
        }}
        pedidoId={pedidoParaNaoEntrega?.id || ""}
        clienteNome={pedidoParaNaoEntrega?.cliente?.nome}
        onSubmit={handleNaoEntregue}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmarExclusao}
        title="Excluir Pedido"
        message="Tem certeza que deseja excluir este pedido? Esta acao nao pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}
