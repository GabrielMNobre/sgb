"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import type { PedidoPaesFormData, ClientePaes, ClientePaesFormData, SemanaPaes } from "@/types/paes";

interface PedidoPaesModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientes: ClientePaes[];
  semanas: SemanaPaes[];
  valorUnitarioPadrao: number;
  creditosDisponiveis?: number;
  pedidoInicial?: PedidoPaesFormData & { id?: string };
  onSubmit: (data: PedidoPaesFormData, id?: string) => Promise<void>;
  onCreateCliente?: (data: ClientePaesFormData) => Promise<void>;
}

export function PedidoPaesModal({
  isOpen,
  onClose,
  clientes,
  semanas,
  valorUnitarioPadrao,
  creditosDisponiveis,
  pedidoInicial,
  onSubmit,
  onCreateCliente,
}: PedidoPaesModalProps) {
  const [formData, setFormData] = useState<PedidoPaesFormData>({
    clienteId: "",
    semanaId: "",
    quantidade: 1,
    valorUnitario: valorUnitarioPadrao,
    pago: false,
    recorrente: false,
    quantidadeSemanas: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [criandoCliente, setCriandoCliente] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState("");
  const [salvandoCliente, setSalvandoCliente] = useState(false);

  useEffect(() => {
    if (pedidoInicial) {
      setFormData(pedidoInicial);
    } else {
      setFormData({
        clienteId: "",
        semanaId: "",
        quantidade: 1,
        valorUnitario: valorUnitarioPadrao,
        pago: false,
        recorrente: false,
        quantidadeSemanas: undefined,
      });
    }
  }, [pedidoInicial, valorUnitarioPadrao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.clienteId ||
      !formData.semanaId ||
      formData.quantidade <= 0 ||
      formData.valorUnitario <= 0
    ) {
      return;
    }

    if (formData.recorrente && (!formData.quantidadeSemanas || formData.quantidadeSemanas < 2)) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, pedidoInicial?.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      clienteId: "",
      semanaId: "",
      quantidade: 1,
      valorUnitario: valorUnitarioPadrao,
      pago: false,
      recorrente: false,
      quantidadeSemanas: undefined,
    });
    setCriandoCliente(false);
    setNovoClienteNome("");
    onClose();
  };

  const handleCriarCliente = async () => {
    if (!novoClienteNome.trim() || !onCreateCliente) return;
    setSalvandoCliente(true);
    try {
      await onCreateCliente({ nome: novoClienteNome.trim() });
      setNovoClienteNome("");
      setCriandoCliente(false);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    } finally {
      setSalvandoCliente(false);
    }
  };

  const clientesAtivos = clientes.filter((c) => c.ativo);
  const valorTotal = formData.quantidade * formData.valorUnitario;
  const isEditing = !!pedidoInicial?.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Editar Pedido" : "Novo Pedido"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cliente */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="clienteId"
              className="block text-sm font-medium text-gray-700"
            >
              Cliente <span className="text-red-500">*</span>
            </label>
            {onCreateCliente && !criandoCliente && (
              <button
                type="button"
                onClick={() => setCriandoCliente(true)}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Novo cliente
              </button>
            )}
          </div>
          {criandoCliente ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={novoClienteNome}
                onChange={(e) => setNovoClienteNome(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCriarCliente();
                  }
                  if (e.key === "Escape") {
                    setCriandoCliente(false);
                    setNovoClienteNome("");
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Nome do novo cliente"
                autoFocus
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCriarCliente}
                disabled={salvandoCliente || !novoClienteNome.trim()}
              >
                {salvandoCliente ? "..." : "Criar"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCriandoCliente(false);
                  setNovoClienteNome("");
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <select
              id="clienteId"
              value={formData.clienteId}
              onChange={(e) =>
                setFormData({ ...formData, clienteId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selecione um cliente</option>
              {clientesAtivos.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Semana */}
        <div>
          <label
            htmlFor="semanaId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Semana (Entrega) <span className="text-red-500">*</span>
          </label>
          <select
            id="semanaId"
            value={formData.semanaId}
            onChange={(e) =>
              setFormData({ ...formData, semanaId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Selecione uma semana</option>
            {semanas.map((semana) => (
              <option key={semana.id} value={semana.id}>
                {formatDate(semana.dataEntrega)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Quantidade */}
          <div>
            <label
              htmlFor="quantidade"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantidade <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantidade"
              value={formData.quantidade || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantidade: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
              required
            />
          </div>

          {/* Valor Unitário */}
          <div>
            <label
              htmlFor="valorUnitario"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Valor Unitário (R$) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="valorUnitario"
              value={formData.valorUnitario || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valorUnitario: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0,00"
              step="0.01"
              min="0.01"
              required
            />
          </div>
        </div>

        {/* Valor Total */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Valor Total:</span>
            <span className="text-lg font-bold text-primary">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(valorTotal)}
            </span>
          </div>
        </div>

        {/* Créditos disponíveis */}
        {creditosDisponiveis && creditosDisponiveis > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Este cliente tem{" "}
              <span className="font-bold">{creditosDisponiveis} créditos</span>{" "}
              disponíveis que serão aplicados automaticamente.
            </p>
          </div>
        )}

        {/* Pago */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pago"
            checked={formData.pago || false}
            onChange={(e) =>
              setFormData({ ...formData, pago: e.target.checked })
            }
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="pago" className="text-sm font-medium text-gray-700">
            Marcar como pago
          </label>
        </div>

        {/* Recorrente (somente ao criar) */}
        {!isEditing && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recorrente"
                checked={formData.recorrente || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recorrente: e.target.checked,
                    quantidadeSemanas: e.target.checked ? 2 : undefined,
                  })
                }
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label
                htmlFor="recorrente"
                className="text-sm font-medium text-gray-700"
              >
                Pedido recorrente
              </label>
            </div>

            {/* Quantidade de Semanas */}
            {formData.recorrente && (
              <div>
                <label
                  htmlFor="quantidadeSemanas"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantidade de Semanas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantidadeSemanas"
                  value={formData.quantidadeSemanas || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantidadeSemanas: parseInt(e.target.value) || 2,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  min="2"
                  required
                />
              </div>
            )}
          </>
        )}

        <ModalFooter className="flex-col-reverse sm:flex-row">
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? <><Loading size="sm" className="mr-2" />Salvando...</> : isEditing ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
