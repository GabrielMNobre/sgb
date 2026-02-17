"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NaoEntregueModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
  clienteNome?: string;
  onSubmit: (pedidoId: string, motivo: string) => Promise<void>;
}

export function NaoEntregueModal({
  isOpen,
  onClose,
  pedidoId,
  clienteNome,
  onSubmit,
}: NaoEntregueModalProps) {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motivo.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(pedidoId, motivo);
      handleClose();
    } catch (error) {
      console.error("Erro ao registrar não entrega:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMotivo("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Não Entrega"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {clienteNome && (
          <p className="text-sm text-gray-600">
            Informe o motivo da não entrega para{" "}
            <span className="font-semibold">{clienteNome}</span>.
          </p>
        )}

        {/* Motivo */}
        <div>
          <label
            htmlFor="motivo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Motivo <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Descreva o motivo da não entrega..."
            rows={3}
            required
          />
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            Ao registrar a não entrega, um crédito será gerado automaticamente para o
            cliente.
          </p>
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
