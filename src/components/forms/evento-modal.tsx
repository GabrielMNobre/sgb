"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import type { EventoFormData } from "@/types/evento";

interface EventoModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventoInicial?: EventoFormData & { id?: string };
  onSubmit: (data: EventoFormData, id?: string) => Promise<void>;
}

export function EventoModal({
  isOpen,
  onClose,
  eventoInicial,
  onSubmit,
}: EventoModalProps) {
  const [formData, setFormData] = useState<EventoFormData>({
    nome: "",
    descricao: "",
    data: "",
    ativo: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventoInicial) {
      setFormData(eventoInicial);
    }
  }, [eventoInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, eventoInicial?.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      descricao: "",
      data: "",
      ativo: true,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={eventoInicial?.id ? "Editar Evento" : "Novo Evento"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label
            htmlFor="nome"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nome"
            value={formData.nome}
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: Acampamento 2024"
            required
          />
        </div>

        {/* Data */}
        <div>
          <label
            htmlFor="data"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data (opcional)
          </label>
          <input
            type="date"
            id="data"
            value={formData.data || ""}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Descrição */}
        <div>
          <label
            htmlFor="descricao"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descrição (opcional)
          </label>
          <Textarea
            id="descricao"
            value={formData.descricao || ""}
            onChange={(e) =>
              setFormData({ ...formData, descricao: e.target.value })
            }
            placeholder="Informações sobre o evento..."
            rows={3}
          />
        </div>

        {/* Ativo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="ativo"
            checked={formData.ativo}
            onChange={(e) =>
              setFormData({ ...formData, ativo: e.target.checked })
            }
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
            Ativo
          </label>
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? <><Loading size="sm" className="mr-2" />Salvando...</> : eventoInicial?.id ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
