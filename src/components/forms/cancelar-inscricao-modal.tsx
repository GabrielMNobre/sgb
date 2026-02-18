"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface CancelarInscricaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  participanteNome: string;
  totalPago: number;
  onConfirm: (valorDevolvido: number) => Promise<void>;
}

const formatCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function CancelarInscricaoModal({
  isOpen,
  onClose,
  participanteNome,
  totalPago,
  onConfirm,
}: CancelarInscricaoModalProps) {
  const [valorDevolvido, setValorDevolvido] = useState(totalPago);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await onConfirm(valorDevolvido);
      handleClose();
    } catch (error) {
      console.error("Erro ao cancelar inscrição:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setValorDevolvido(totalPago);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancelar Inscrição"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Aviso */}
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">
            Tem certeza que deseja cancelar a inscrição de{" "}
            <strong>{participanteNome}</strong>?
          </p>
        </div>

        {/* Total já pago */}
        <div>
          <p className="text-sm text-gray-700">
            Total já pago: <strong>{formatCurrency.format(totalPago)}</strong>
          </p>
        </div>

        {/* Valor a devolver */}
        <div>
          <label
            htmlFor="valorDevolvido"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Valor a devolver
          </label>
          <input
            type="number"
            id="valorDevolvido"
            value={valorDevolvido || ""}
            onChange={(e) =>
              setValorDevolvido(parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0,00"
            step="0.01"
            min="0"
            max={totalPago}
          />
        </div>

        <ModalFooter className="flex-col-reverse sm:flex-row">
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
