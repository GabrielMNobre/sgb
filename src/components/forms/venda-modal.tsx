"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import type { VendaFormData } from "@/types/venda";
import type { CategoriaVenda } from "@/types/venda";

interface VendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: CategoriaVenda[];
  vendaInicial?: VendaFormData & { id?: string };
  onSubmit: (data: VendaFormData, id?: string) => Promise<void>;
}

export function VendaModal({
  isOpen,
  onClose,
  categorias,
  vendaInicial,
  onSubmit,
}: VendaModalProps) {
  const hoje = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState<VendaFormData>({
    categoriaId: "",
    data: hoje,
    descricao: "",
    quantidade: 1,
    valorUnitario: 0,
    observacao: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendaInicial) {
      setFormData(vendaInicial);
    } else {
      setFormData({
        categoriaId: "",
        data: hoje,
        descricao: "",
        quantidade: 1,
        valorUnitario: 0,
        observacao: "",
      });
    }
  }, [vendaInicial, hoje]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.data || !formData.descricao || formData.quantidade <= 0 || formData.valorUnitario <= 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, vendaInicial?.id);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      categoriaId: "",
      data: hoje,
      descricao: "",
      quantidade: 1,
      valorUnitario: 0,
      observacao: "",
    });
    onClose();
  };

  const categoriasAtivas = categorias.filter((c) => c.ativo);
  const valorTotal = formData.quantidade * formData.valorUnitario;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={vendaInicial?.id ? "Editar Venda" : "Nova Venda"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Categoria */}
        <div>
          <label
            htmlFor="categoriaId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Categoria
          </label>
          <select
            id="categoriaId"
            value={formData.categoriaId || ""}
            onChange={(e) =>
              setFormData({ ...formData, categoriaId: e.target.value || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Sem categoria</option>
            {categoriasAtivas.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
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
            placeholder="Ex: Lenço desbravador"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Quantidade */}
          <div>
            <label
              htmlFor="quantidade"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantidade <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantidade"
              value={formData.quantidade || ""}
              onChange={(e) =>
                setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
              required
            />
          </div>

          {/* Valor Unitário */}
          <div>
            <label
              htmlFor="valorUnitario"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Valor Unitário (R$) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="valorUnitario"
              value={formData.valorUnitario || ""}
              onChange={(e) =>
                setFormData({ ...formData, valorUnitario: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0,00"
              step="0.01"
              min="0.01"
              required
            />
          </div>
        </div>

        {/* Valor Total (calculado automaticamente) */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Valor Total:</span>
            <span className="text-lg font-bold text-primary">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(valorTotal)}
            </span>
          </div>
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
            placeholder="Informações adicionais sobre a venda..."
            rows={3}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? <><Loading size="sm" className="mr-2" />Salvando...</> : vendaInicial?.id ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
