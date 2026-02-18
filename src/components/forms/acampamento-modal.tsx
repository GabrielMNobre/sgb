"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AcampamentoFormData } from "@/types/acampamento";

interface AcampamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  acampamentoInicial?: AcampamentoFormData & { id?: string };
  onSubmit: (data: AcampamentoFormData, id?: string) => Promise<void>;
}

export function AcampamentoModal({
  isOpen,
  onClose,
  acampamentoInicial,
  onSubmit,
}: AcampamentoModalProps) {
  const [formData, setFormData] = useState<AcampamentoFormData>({
    nome: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    valorPorPessoa: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (acampamentoInicial) {
      setFormData(acampamentoInicial);
    } else {
      setFormData({
        nome: "",
        descricao: "",
        dataInicio: "",
        dataFim: "",
        valorPorPessoa: 0,
      });
    }
  }, [acampamentoInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.dataInicio || !formData.dataFim || formData.valorPorPessoa < 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, acampamentoInicial?.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar acampamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      descricao: "",
      dataInicio: "",
      dataFim: "",
      valorPorPessoa: 0,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={acampamentoInicial?.id ? "Editar Acampamento" : "Novo Acampamento"}
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
            placeholder="Ex: Acampamento de Verão 2026"
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
            placeholder="Informações adicionais sobre o acampamento..."
            rows={3}
          />
        </div>

        {/* Data Início */}
        <div>
          <label
            htmlFor="dataInicio"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data Início <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dataInicio"
            value={formData.dataInicio}
            onChange={(e) =>
              setFormData({ ...formData, dataInicio: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* Data Fim */}
        <div>
          <label
            htmlFor="dataFim"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data Fim <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dataFim"
            value={formData.dataFim}
            onChange={(e) =>
              setFormData({ ...formData, dataFim: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* Valor por Pessoa */}
        <div>
          <label
            htmlFor="valorPorPessoa"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Valor por Pessoa (R$) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="valorPorPessoa"
            value={formData.valorPorPessoa || ""}
            onChange={(e) =>
              setFormData({ ...formData, valorPorPessoa: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0,00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <ModalFooter className="flex-col-reverse sm:flex-row">
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Salvando..." : acampamentoInicial?.id ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
