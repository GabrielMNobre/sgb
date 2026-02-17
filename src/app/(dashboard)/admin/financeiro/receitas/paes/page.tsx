"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PedidosPaesTable } from "@/components/tables/pedidos-paes-table";
import { SemanasPaesTable } from "@/components/tables/semanas-paes-table";
import { PedidoPaesModal } from "@/components/forms/pedido-paes-modal";
import { VenderSemDonoModal } from "@/components/forms/vender-sem-dono-modal";
import { SemanaPaesModal } from "@/components/forms/semana-paes-modal";
import { NaoEntregueModal } from "@/components/forms/nao-entregue-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, ShoppingBag, Wheat } from "lucide-react";
import type {
  PedidoPaesComCliente,
  PedidoPaesFormData,
  SemanaPaesComResumo,
  SemanaPaesFormData,
  ClientePaes,
  ClientePaesFormData,
  ConfiguracoesPaes,
} from "@/types/paes";
import {
  criarPedidoPaesAction,
  editarPedidoPaesAction,
  excluirPedidoPaesAction,
  marcarPagoPaesAction,
  marcarEntreguePaesAction,
  marcarNaoEntreguePaesAction,
  criarPedidoSemDonoAction,
  criarSemanaPaesAction,
  criarClientePaesAction,
} from "./actions";
import { formatDate } from "@/lib/utils/date";

export default function PaesPage() {
  const [semanas, setSemanas] = useState<SemanaPaesComResumo[]>([]);
  const [pedidos, setPedidos] = useState<PedidoPaesComCliente[]>([]);
  const [clientes, setClientes] = useState<ClientePaes[]>([]);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesPaes | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const [pedidoModalOpen, setPedidoModalOpen] = useState(false);
  const [vendaSemDonoModalOpen, setVendaSemDonoModalOpen] = useState(false);
  const [semanaModalOpen, setSemanaModalOpen] = useState(false);
  const [naoEntregueModalOpen, setNaoEntregueModalOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState<string | null>(
    null
  );
  const [pedidoParaEditar, setPedidoParaEditar] = useState<PedidoPaesComCliente | null>(null);
  const [pedidoParaNaoEntrega, setPedidoParaNaoEntrega] =
    useState<PedidoPaesComCliente | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [semanasRes, clientesRes, configRes] = await Promise.all([
        fetch("/api/paes/semanas"),
        fetch("/api/paes/clientes"),
        fetch("/api/paes/configuracoes"),
      ]);

      if (semanasRes.ok && clientesRes.ok && configRes.ok) {
        const semanasData: SemanaPaesComResumo[] = await semanasRes.json();
        const clientesData: ClientePaes[] = await clientesRes.json();
        const configData: ConfiguracoesPaes = await configRes.json();

        setSemanas(Array.isArray(semanasData) ? semanasData : []);
        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setConfiguracoes(configData);

        const semanaAberta = (
          Array.isArray(semanasData) ? semanasData : []
        ).find((s) => s.status === "aberta");

        if (semanaAberta) {
          const pedidosRes = await fetch(
            `/api/paes/pedidos?semanaId=${semanaAberta.id}`
          );
          if (pedidosRes.ok) {
            const pedidosData: PedidoPaesComCliente[] =
              await pedidosRes.json();
            setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
          }
        } else {
          setPedidos([]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setSemanas([]);
      setPedidos([]);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const semanaAtual = semanas.find((s) => s.status === "aberta") || null;

  const totalPotencial = semanas.reduce((sum, s) => sum + s.totalValor, 0);
  const totalPago = semanas.reduce((sum, s) => sum + s.totalPago, 0);
  const totalPendente = totalPotencial - totalPago;
  const totalPedidos = semanas.reduce((sum, s) => sum + s.totalPedidos, 0);
  const totalPaes = semanas.reduce((sum, s) => sum + s.totalPaes, 0);
  const totalFornadas = semanas.reduce((sum, s) => sum + s.fornadas, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  // === Handlers ===

  const handleCriarCliente = async (data: ClientePaesFormData) => {
    await criarClientePaesAction(data);
    await carregarDados();
  };

  const handleNovoPedido = () => {
    setPedidoParaEditar(null);
    setPedidoModalOpen(true);
  };

  const handleEditarPedido = (pedido: PedidoPaesComCliente) => {
    setPedidoParaEditar(pedido);
    setPedidoModalOpen(true);
  };

  const handleVenderSemDono = () => {
    setVendaSemDonoModalOpen(true);
  };

  const handleNovaSemana = () => {
    setSemanaModalOpen(true);
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

  const handleSalvarVendaSemDono = async (
    data: PedidoPaesFormData,
    pago: boolean
  ) => {
    await criarPedidoSemDonoAction(data, pago);
    await carregarDados();
  };

  const handleSalvarSemana = async (data: SemanaPaesFormData, id?: string) => {
    await criarSemanaPaesAction(data);
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

  const handleNaoEntregue = (pedido: PedidoPaesComCliente) => {
    setPedidoParaNaoEntrega(pedido);
    setNaoEntregueModalOpen(true);
  };

  const handleConfirmarNaoEntregue = async (
    pedidoId: string,
    motivo: string
  ) => {
    await marcarNaoEntreguePaesAction(pedidoId, motivo);
    setNaoEntregueModalOpen(false);
    setPedidoParaNaoEntrega(null);
    await carregarDados();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paes</h1>
          <p className="text-gray-600 mt-1">
            Gestao de producao e venda de paes
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleNovaSemana}>
            <Wheat className="w-4 h-4 mr-2" />
            Nova Semana
          </Button>
          <Button variant="secondary" onClick={handleVenderSemDono}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Vender Sem Dono
          </Button>
          <Button variant="primary" onClick={handleNovoPedido}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total Arrecadado</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {formatCurrency(totalPago)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Pendente</p>
            <p className={`text-3xl font-bold mt-1 ${totalPendente > 0 ? "text-amber-600" : "text-gray-400"}`}>
              {formatCurrency(totalPendente)}
            </p>
          </div>
        </Card>
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
            <p className="text-sm text-gray-600">Total Pães</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalPaes}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Fornadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalFornadas}
            </p>
          </div>
        </Card>
      </div>

      {/* Semana Atual */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Semana Atual
          </h2>
          {semanaAtual ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="success">Aberta</Badge>
                <span className="text-sm text-gray-600">
                  Producao: {formatDate(semanaAtual.dataProducao)} | Entrega:{" "}
                  {formatDate(semanaAtual.dataEntrega)}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Pedidos</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {semanaAtual.totalPedidos}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Paes</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {semanaAtual.totalPaes}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Fornadas</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {semanaAtual.fornadas}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Valor Total</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(semanaAtual.totalValor)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Pago</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(semanaAtual.totalPago)}
                  </p>
                </div>
              </div>
              {semanaAtual.paesSemDono > 0 && (
                <p className="text-sm text-amber-600">
                  {semanaAtual.paesSemDono} paes sem dono nesta semana
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wheat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Nenhuma semana aberta no momento.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Clique em &quot;Nova Semana&quot; para iniciar uma nova semana de
                producao.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Pedidos da Semana */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pedidos da Semana
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : semanaAtual ? (
            <PedidosPaesTable
              pedidos={pedidos}
              onEdit={handleEditarPedido}
              onMarcarPago={handleMarcarPago}
              onMarcarEntregue={handleMarcarEntregue}
              onMarcarNaoEntregue={(id) => {
                const pedido = pedidos.find((p) => p.id === id);
                if (pedido) handleNaoEntregue(pedido);
              }}
              onDelete={handleExcluirPedido}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Nenhuma semana aberta para exibir pedidos.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Semanas Recentes */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Semanas Recentes
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <SemanasPaesTable
              semanas={semanas.slice(0, 5)}
              basePath="/admin/financeiro/receitas/paes/semanas"
            />
          )}
        </div>
      </Card>

      {/* Modal Novo/Editar Pedido */}
      <PedidoPaesModal
        isOpen={pedidoModalOpen}
        onClose={() => {
          setPedidoModalOpen(false);
          setPedidoParaEditar(null);
        }}
        clientes={clientes}
        semanas={semanas.filter((s) => s.status === "aberta")}
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

      {/* Modal Vender Sem Dono */}
      <VenderSemDonoModal
        isOpen={vendaSemDonoModalOpen}
        onClose={() => setVendaSemDonoModalOpen(false)}
        clientes={clientes}
        semanaAtual={semanas.find((s) => s.status === "aberta")}
        valorUnitarioPadrao={configuracoes?.valorUnitarioPadrao || 10}
        onSubmit={handleSalvarVendaSemDono}
        onCreateCliente={handleCriarCliente}
      />

      {/* Modal Nova Semana */}
      <SemanaPaesModal
        isOpen={semanaModalOpen}
        onClose={() => setSemanaModalOpen(false)}
        onSubmit={handleSalvarSemana}
      />

      {/* Modal Nao Entregue */}
      <NaoEntregueModal
        isOpen={naoEntregueModalOpen}
        onClose={() => setNaoEntregueModalOpen(false)}
        pedidoId={pedidoParaNaoEntrega?.id || ""}
        clienteNome={pedidoParaNaoEntrega?.cliente?.nome}
        onSubmit={handleConfirmarNaoEntregue}
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
