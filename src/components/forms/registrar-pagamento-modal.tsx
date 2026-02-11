"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { RegistrarPagamentoFormData } from "@/types/mensalidade";

interface RegistrarPagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mensalidadeIds: string[];
  quantidadeSelecionada: number;
  valorTotal: number;
  onSubmit: (data: RegistrarPagamentoFormData) => Promise<void>;
}

export function RegistrarPagamentoModal({
  isOpen,
  onClose,
  mensalidadeIds,
  quantidadeSelecionada,
  valorTotal,
  onSubmit,
}: RegistrarPagamentoModalProps) {
  const hoje = new Date().toISOString().split("T")[0];
  const [dataPagamento, setDataPagamento] = useState(hoje);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dataPagamento) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        mensalidadeIds,
        dataPagamento,
      });
      handleClose();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDataPagamento(hoje);
    onClose();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Pagamento"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Summary */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Mensalidades selecionadas:
              </span>
              <span className="text-sm font-bold text-gray-900">
                {quantidadeSelecionada}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Valor total:
              </span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Data de Pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data do Pagamento *
          </label>
          <input
            type="date"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Registrando..."
              : quantidadeSelecionada > 1
              ? "Registrar Pagamentos"
              : "Registrar Pagamento"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
