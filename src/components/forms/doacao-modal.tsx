"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DoacaoFormData } from "@/types/doacao";

interface DoacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  doacaoInicial?: DoacaoFormData & { id?: string };
  onSubmit: (data: DoacaoFormData, id?: string) => Promise<void>;
}

export function DoacaoModal({
  isOpen,
  onClose,
  doacaoInicial,
  onSubmit,
}: DoacaoModalProps) {
  const hoje = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState<DoacaoFormData>({
    data: hoje,
    valor: 0,
    doador: "",
    observacao: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doacaoInicial) {
      setFormData(doacaoInicial);
    } else {
      setFormData({
        data: hoje,
        valor: 0,
        doador: "",
        observacao: "",
      });
    }
  }, [doacaoInicial, hoje]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.data || formData.valor <= 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, doacaoInicial?.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar doação:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      data: hoje,
      valor: 0,
      doador: "",
      observacao: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={doacaoInicial?.id ? "Editar Doação" : "Nova Doação"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Doador */}
        <div>
          <label
            htmlFor="doador"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Doador (opcional)
          </label>
          <input
            type="text"
            id="doador"
            value={formData.doador || ""}
            onChange={(e) =>
              setFormData({ ...formData, doador: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: João Silva"
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
            placeholder="Informações adicionais sobre a doação..."
            rows={3}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Salvando..." : doacaoInicial?.id ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
