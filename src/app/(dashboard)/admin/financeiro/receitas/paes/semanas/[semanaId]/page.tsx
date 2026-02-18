"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PedidosPaesTable } from "@/components/tables/pedidos-paes-table";
import { PedidoPaesModal } from "@/components/forms/pedido-paes-modal";
import { VenderSemDonoModal } from "@/components/forms/vender-sem-dono-modal";
import { NaoEntregueModal } from "@/components/forms/nao-entregue-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loading } from "@/components/ui/loading";
import { ArrowLeft, Plus, ShoppingBag, Lock } from "lucide-react";
import type {
  SemanaPaesComResumo,
  PedidoPaesComCliente,
  PedidoPaesFormData,
  ClientePaesFormData,
  ClientePaes,
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
  atualizarCustoProducaoAction,
  finalizarSemanaPaesAction,
  gerarRecorrentesParaSemanaAction,
  criarClientePaesAction,
} from "../../actions";
import { formatDate } from "@/lib/utils/date";

export default function SemanaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const semanaId = params.semanaId as string;

  const [semana, setSemana] = useState<SemanaPaesComResumo | null>(null);
  const [pedidos, setPedidos] = useState<PedidoPaesComCliente[]>([]);
  const [clientes, setClientes] = useState<ClientePaes[]>([]);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesPaes | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const [pedidoParaEditar, setPedidoParaEditar] = useState<PedidoPaesComCliente | null>(null);
  const [modalPedidoOpen, setModalPedidoOpen] = useState(false);
  const [modalVenderSemDonoOpen, setModalVenderSemDonoOpen] = useState(false);
  const [modalNaoEntregueOpen, setModalNaoEntregueOpen] = useState(false);
  const [pedidoNaoEntregueId, setPedidoNaoEntregueId] = useState<string | null>(
    null
  );
  const [finalizarDialogOpen, setFinalizarDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState<string | null>(
    null
  );

  const [custoEditando, setCustoEditando] = useState(false);
  const [custoValor, setCustoValor] = useState<number>(0);

  useEffect(() => {
    if (semanaId) {
      carregarDados();
    }
  }, [semanaId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [semanaRes, pedidosRes, clientesRes, configRes] = await Promise.all(
        [
          fetch(`/api/paes/semanas/${semanaId}`),
          fetch(`/api/paes/pedidos?semanaId=${semanaId}`),
          fetch("/api/paes/clientes"),
          fetch("/api/paes/configuracoes"),
        ]
      );

      if (semanaRes.ok) {
        const semanaData = await semanaRes.json();
        setSemana(semanaData.semana || semanaData);
        setCustoValor(semanaData.semana?.custoProducao || semanaData.custoProducao || 0);
        if (semanaData.pedidos) {
          setPedidos(Array.isArray(semanaData.pedidos) ? semanaData.pedidos : []);
        }
      }
      if (pedidosRes.ok) {
        const pedidosData = await pedidosRes.json();
        setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      }
      if (clientesRes.ok) {
        const clientesData = await clientesRes.json();
        setClientes(Array.isArray(clientesData) ? clientesData : []);
      }
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfiguracoes(configData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

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
    setModalPedidoOpen(true);
  };

  const handleEditarPedido = (pedido: PedidoPaesComCliente) => {
    setPedidoParaEditar(pedido);
    setModalPedidoOpen(true);
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

  const handleVenderSemDono = () => {
    setModalVenderSemDonoOpen(true);
  };

  const handleSalvarVendaSemDono = async (
    data: PedidoPaesFormData,
    pago: boolean
  ) => {
    await criarPedidoSemDonoAction(data, pago);
    await carregarDados();
  };

  const handleMarcarPago = async (id: string) => {
    await marcarPagoPaesAction(id);
    await carregarDados();
  };

  const handleMarcarEntregue = async (id: string) => {
    await marcarEntreguePaesAction(id);
    await carregarDados();
  };

  const handleMarcarNaoEntregue = (id: string) => {
    setPedidoNaoEntregueId(id);
    setModalNaoEntregueOpen(true);
  };

  const handleConfirmarNaoEntregue = async (pedidoId: string, motivo: string) => {
    await marcarNaoEntreguePaesAction(pedidoId, motivo);
    await carregarDados();
    setModalNaoEntregueOpen(false);
    setPedidoNaoEntregueId(null);
  };

  const handleExcluirPedido = (id: string) => {
    setPedidoParaExcluir(id);
    setDeleteDialogOpen(true);
  };

  const confirmarExclusaoPedido = async () => {
    if (pedidoParaExcluir) {
      await excluirPedidoPaesAction(pedidoParaExcluir);
      await carregarDados();
    }
    setDeleteDialogOpen(false);
    setPedidoParaExcluir(null);
  };

  const handleSalvarCusto = async () => {
    if (semana) {
      await atualizarCustoProducaoAction(semana.id, custoValor);
      await carregarDados();
      setCustoEditando(false);
    }
  };

  const handleFinalizarSemana = () => {
    setFinalizarDialogOpen(true);
  };

  const confirmarFinalizarSemana = async () => {
    if (semana) {
      await finalizarSemanaPaesAction(semana.id);
      await carregarDados();
    }
    setFinalizarDialogOpen(false);
  };

  const handleGerarRecorrentes = async () => {
    if (semana) {
      await gerarRecorrentesParaSemanaAction(semana.id);
      await carregarDados();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loading size="lg" />
        <p className="text-gray-500 mt-3">Carregando...</p>
      </div>
    );
  }

  if (!semana) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Semana não encontrada.</p>
      </div>
    );
  }

  const isAberta = semana.status === "aberta";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/financeiro/receitas/paes/semanas")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Semanas
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Semana de {formatDate(semana.dataProducao)}
          </h1>
          <Badge variant={isAberta ? "success" : "secondary"}>
            {isAberta ? "Aberta" : "Finalizada"}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Data Produção</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(semana.dataProducao)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Entrega</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(semana.dataEntrega)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Custo Produção</p>
              {isAberta && custoEditando ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={custoValor}
                    onChange={(e) => setCustoValor(Number(e.target.value))}
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="sm" variant="primary" onClick={handleSalvarCusto}>
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setCustoEditando(false);
                      setCustoValor(semana.custoProducao || 0);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p
                  className={`text-lg font-semibold text-gray-900 ${
                    isAberta ? "cursor-pointer hover:text-primary" : ""
                  }`}
                  onClick={() => {
                    if (isAberta) {
                      setCustoEditando(true);
                    }
                  }}
                >
                  {formatCurrency(semana.custoProducao || 0)}
                  {isAberta && (
                    <span className="text-xs text-gray-400 ml-2">
                      (clique para editar)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Pedidos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {semana.totalPedidos}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Pães</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {semana.totalPaes}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Fornadas</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {semana.fornadas}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Pães Sem Dono</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {semana.paesSemDono}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Valor</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(semana.totalValor)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Pago</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(semana.totalPago)}
            </p>
          </div>
        </Card>
      </div>

      {/* Action buttons */}
      {isAberta && (
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={handleNovoPedido}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Pedido
          </Button>
          <Button variant="secondary" onClick={handleVenderSemDono}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Vender Sem Dono
          </Button>
          <Button variant="outline" onClick={handleGerarRecorrentes}>
            Gerar Recorrentes
          </Button>
          <Button variant="danger" onClick={handleFinalizarSemana}>
            <Lock className="w-4 h-4 mr-2" />
            Finalizar Semana
          </Button>
        </div>
      )}

      {/* Pedidos table */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos</h2>
          {pedidos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum pedido nesta semana.</p>
            </div>
          ) : (
            <PedidosPaesTable
              pedidos={pedidos}
              onEdit={handleEditarPedido}
              onMarcarPago={handleMarcarPago}
              onMarcarEntregue={handleMarcarEntregue}
              onMarcarNaoEntregue={handleMarcarNaoEntregue}
              onDelete={handleExcluirPedido}
              showActions={isAberta}
            />
          )}
        </div>
      </Card>

      {/* Modal Novo/Editar Pedido */}
      <PedidoPaesModal
        isOpen={modalPedidoOpen}
        onClose={() => {
          setModalPedidoOpen(false);
          setPedidoParaEditar(null);
        }}
        clientes={clientes}
        semanas={semana ? [semana] : []}
        valorUnitarioPadrao={configuracoes?.valorUnitarioPadrao ?? 10}
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
        isOpen={modalVenderSemDonoOpen}
        onClose={() => setModalVenderSemDonoOpen(false)}
        clientes={clientes}
        semanaAtual={semana || undefined}
        valorUnitarioPadrao={configuracoes?.valorUnitarioPadrao ?? 10}
        onSubmit={handleSalvarVendaSemDono}
        onCreateCliente={handleCriarCliente}
      />

      {/* Modal Não Entregue */}
      <NaoEntregueModal
        isOpen={modalNaoEntregueOpen}
        onClose={() => {
          setModalNaoEntregueOpen(false);
          setPedidoNaoEntregueId(null);
        }}
        pedidoId={pedidoNaoEntregueId || ""}
        clienteNome={pedidos.find((p) => p.id === pedidoNaoEntregueId)?.cliente?.nome}
        onSubmit={handleConfirmarNaoEntregue}
      />

      {/* Confirm Delete Pedido */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmarExclusaoPedido}
        title="Excluir Pedido"
        message="Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />

      {/* Confirm Finalizar Semana */}
      <ConfirmDialog
        isOpen={finalizarDialogOpen}
        onClose={() => setFinalizarDialogOpen(false)}
        onConfirm={confirmarFinalizarSemana}
        title="Finalizar Semana"
        message="Tem certeza que deseja finalizar esta semana? Verifique se todas as entregas foram realizadas. Após finalizar, não será possível adicionar ou modificar pedidos."
        confirmText="Finalizar"
        variant="warning"
      />
    </div>
  );
}
