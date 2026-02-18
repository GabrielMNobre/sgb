"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import type { PedidoPaesFormData, ClientePaes, ClientePaesFormData, SemanaPaes } from "@/types/paes";

interface VenderSemDonoModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientes: ClientePaes[];
  semanaAtual?: SemanaPaes;
  valorUnitarioPadrao: number;
  onSubmit: (data: PedidoPaesFormData, pago: boolean) => Promise<void>;
  onCreateCliente?: (data: ClientePaesFormData) => Promise<void>;
}

export function VenderSemDonoModal({
  isOpen,
  onClose,
  clientes,
  semanaAtual,
  valorUnitarioPadrao,
  onSubmit,
  onCreateCliente,
}: VenderSemDonoModalProps) {
  const [formData, setFormData] = useState({
    clienteId: "",
    quantidade: 1,
    valorUnitario: valorUnitarioPadrao,
    pago: false,
  });
  const [loading, setLoading] = useState(false);
  const [criandoCliente, setCriandoCliente] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState("");
  const [salvandoCliente, setSalvandoCliente] = useState(false);

  useEffect(() => {
    setFormData({
      clienteId: "",
      quantidade: 1,
      valorUnitario: valorUnitarioPadrao,
      pago: false,
    });
  }, [valorUnitarioPadrao, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clienteId || formData.quantidade <= 0 || formData.valorUnitario <= 0) {
      return;
    }

    if (!semanaAtual) {
      return;
    }

    setLoading(true);
    try {
      const pedidoData: PedidoPaesFormData = {
        clienteId: formData.clienteId,
        semanaId: semanaAtual.id,
        quantidade: formData.quantidade,
        valorUnitario: formData.valorUnitario,
      };
      await onSubmit(pedidoData, formData.pago);
      handleClose();
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      clienteId: "",
      quantidade: 1,
      valorUnitario: valorUnitarioPadrao,
      pago: false,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Vender Pães Sem Dono"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {semanaAtual && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              Semana de entrega:{" "}
              <span className="font-semibold">
                {formatDate(semanaAtual.dataEntrega)}
              </span>
            </p>
          </div>
        )}

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

        {/* Pago */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pago"
            checked={formData.pago}
            onChange={(e) =>
              setFormData({ ...formData, pago: e.target.checked })
            }
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="pago" className="text-sm font-medium text-gray-700">
            Marcar como pago
          </label>
        </div>

        <ModalFooter className="flex-col-reverse sm:flex-row">
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Registrando..." : "Registrar Venda"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
