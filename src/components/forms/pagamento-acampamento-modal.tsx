"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PagamentoFormData } from "@/types/acampamento";

interface PagamentoAcampamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantes?: Array<{ id: string; nome: string }>;
  participanteIdFixo?: string;
  onSubmit: (data: PagamentoFormData) => Promise<void>;
}

export function PagamentoAcampamentoModal({
  isOpen,
  onClose,
  participantes,
  participanteIdFixo,
  onSubmit,
}: PagamentoAcampamentoModalProps) {
  const hoje = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState<PagamentoFormData>({
    participanteId: participanteIdFixo || "",
    data: hoje,
    valor: 0,
    observacao: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      participanteId: participanteIdFixo || "",
      data: hoje,
      valor: 0,
      observacao: "",
    });
  }, [participanteIdFixo, hoje, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.participanteId || !formData.data || formData.valor <= 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      participanteId: participanteIdFixo || "",
      data: hoje,
      valor: 0,
      observacao: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Pagamento"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Participante */}
        <div>
          <label
            htmlFor="participanteId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Participante <span className="text-red-500">*</span>
          </label>
          <select
            id="participanteId"
            value={formData.participanteId}
            onChange={(e) =>
              setFormData({ ...formData, participanteId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={!!participanteIdFixo}
          >
            <option value="">Selecione um participante</option>
            {participantes?.map((participante) => (
              <option key={participante.id} value={participante.id}>
                {participante.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Data */}
        <div>
          <label
            htmlFor="data"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="data"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* Valor */}
        <div>
          <label
            htmlFor="valor"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Valor (R$) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="valor"
            value={formData.valor || ""}
            onChange={(e) =>
              setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0,00"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        {/* Observação */}
        <div>
          <label
            htmlFor="observacao"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Observação (opcional)
          </label>
          <Textarea
            id="observacao"
            value={formData.observacao || ""}
            onChange={(e) =>
              setFormData({ ...formData, observacao: e.target.value })
            }
            placeholder="Informações adicionais sobre o pagamento..."
            rows={3}
          />
        </div>

        <ModalFooter className="flex-col-reverse sm:flex-row">
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Salvando..." : "Registrar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
