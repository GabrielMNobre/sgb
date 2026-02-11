"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { GastoFormData } from "@/types/gasto";
import type { Evento } from "@/types/evento";

interface GastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventos: Evento[];
  gastoInicial?: GastoFormData & { id?: string };
  eventoIdPadrao?: string;
  onSubmit: (data: GastoFormData, id?: string) => Promise<void>;
}

export function GastoModal({
  isOpen,
  onClose,
  eventos,
  gastoInicial,
  eventoIdPadrao,
  onSubmit,
}: GastoModalProps) {
  const hoje = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState<GastoFormData>({
    eventoId: eventoIdPadrao || "",
    data: hoje,
    descricao: "",
    valor: 0,
    observacao: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gastoInicial) {
      setFormData(gastoInicial);
    } else if (eventoIdPadrao) {
      setFormData((prev) => ({ ...prev, eventoId: eventoIdPadrao }));
    }
  }, [gastoInicial, eventoIdPadrao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.eventoId || !formData.data || !formData.descricao || formData.valor <= 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, gastoInicial?.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar gasto:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      eventoId: eventoIdPadrao || "",
      data: hoje,
      descricao: "",
      valor: 0,
      observacao: "",
    });
    onClose();
  };

  const eventosAtivos = eventos.filter((e) => e.ativo);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={gastoInicial?.id ? "Editar Gasto" : "Novo Gasto"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Evento */}
        <div>
          <label
            htmlFor="eventoId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Evento <span className="text-red-500">*</span>
          </label>
          <select
            id="eventoId"
            value={formData.eventoId}
            onChange={(e) =>
              setFormData({ ...formData, eventoId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={!!eventoIdPadrao}
          >
            <option value="">Selecione um evento</option>
            {eventosAtivos.map((evento) => (
              <option key={evento.id} value={evento.id}>
                {evento.nome}
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

        {/* Descrição */}
        <div>
          <label
            htmlFor="descricao"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descrição <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="descricao"
            value={formData.descricao}
            onChange={(e) =>
              setFormData({ ...formData, descricao: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: Material de camping"
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
            placeholder="Informações adicionais sobre o gasto..."
            rows={3}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Salvando..." : gastoInicial?.id ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
