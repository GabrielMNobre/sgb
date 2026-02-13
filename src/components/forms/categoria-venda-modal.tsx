"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CategoriaVendaFormData } from "@/types/venda";

interface CategoriaVendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoriaInicial?: CategoriaVendaFormData & { id?: string };
  onSubmit: (data: CategoriaVendaFormData, id?: string) => Promise<void>;
}

export function CategoriaVendaModal({
  isOpen,
  onClose,
  categoriaInicial,
  onSubmit,
}: CategoriaVendaModalProps) {
  const [formData, setFormData] = useState<CategoriaVendaFormData>({
    nome: "",
    descricao: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoriaInicial) {
      setFormData(categoriaInicial);
    } else {
      setFormData({
        nome: "",
        descricao: "",
      });
    }
  }, [categoriaInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, categoriaInicial?.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      descricao: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={categoriaInicial?.id ? "Editar Categoria" : "Nova Categoria"}
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
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: Uniformes"
            required
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
            placeholder="Descrição da categoria..."
            rows={2}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Salvando..." : categoriaInicial?.id ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
