"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import type { ClientePaesFormData } from "@/types/paes";

interface ClientePaesModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteInicial?: ClientePaesFormData & { id?: string };
  onSubmit: (data: ClientePaesFormData, id?: string) => Promise<void>;
}

export function ClientePaesModal({
  isOpen,
  onClose,
  clienteInicial,
  onSubmit,
}: ClientePaesModalProps) {
  const [formData, setFormData] = useState<ClientePaesFormData>({
    nome: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clienteInicial) {
      setFormData(clienteInicial);
    } else {
      setFormData({ nome: "" });
    }
  }, [clienteInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, clienteInicial?.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ nome: "" });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={clienteInicial?.id ? "Editar Cliente" : "Novo Cliente"}
      size="md"
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
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Nome do cliente"
            required
          />
        </div>

        <ModalFooter className="flex-col-reverse sm:flex-row">
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? <><Loading size="sm" className="mr-2" />Salvando...</> : clienteInicial?.id ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
