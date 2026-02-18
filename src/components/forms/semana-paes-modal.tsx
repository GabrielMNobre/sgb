"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { SemanaPaesFormData } from "@/types/paes";

interface SemanaPaesModalProps {
  isOpen: boolean;
  onClose: () => void;
  semanaInicial?: SemanaPaesFormData & { id?: string };
  onSubmit: (data: SemanaPaesFormData, id?: string) => Promise<void>;
}

export function SemanaPaesModal({
  isOpen,
  onClose,
  semanaInicial,
  onSubmit,
}: SemanaPaesModalProps) {
  const [formData, setFormData] = useState<SemanaPaesFormData>({
    dataProducao: "",
    dataEntrega: "",
    custoProducao: undefined,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (semanaInicial) {
      setFormData(semanaInicial);
    } else {
      setFormData({
        dataProducao: "",
        dataEntrega: "",
        custoProducao: undefined,
      });
    }
  }, [semanaInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dataProducao || !formData.dataEntrega) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, semanaInicial?.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar semana:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      dataProducao: "",
      dataEntrega: "",
      custoProducao: undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={semanaInicial?.id ? "Editar Semana" : "Nova Semana"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Data de Produção */}
          <div>
            <label
              htmlFor="dataProducao"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data de Produção <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dataProducao"
              value={formData.dataProducao}
              onChange={(e) =>
                setFormData({ ...formData, dataProducao: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Data de Entrega */}
          <div>
            <label
              htmlFor="dataEntrega"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data de Entrega <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dataEntrega"
              value={formData.dataEntrega}
              onChange={(e) =>
                setFormData({ ...formData, dataEntrega: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Custo de Produção */}
        <div>
          <label
            htmlFor="custoProducao"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Custo de Produção (R$)
          </label>
          <input
            type="number"
            id="custoProducao"
            value={formData.custoProducao ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                custoProducao: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0,00"
            step="0.01"
            min="0"
          />
        </div>

        <ModalFooter className="flex-col-reverse sm:flex-row">
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Salvando..." : semanaInicial?.id ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
