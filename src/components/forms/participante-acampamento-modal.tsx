"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ParticipanteFormData } from "@/types/acampamento";

interface ParticipanteAcampamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  membrosDisponiveis: Array<{ id: string; nome: string }>;
  valorPadrao: number;
  onSubmit: (data: ParticipanteFormData) => Promise<void>;
}

export function ParticipanteAcampamentoModal({
  isOpen,
  onClose,
  membrosDisponiveis,
  valorPadrao,
  onSubmit,
}: ParticipanteAcampamentoModalProps) {
  const [formData, setFormData] = useState<ParticipanteFormData>({
    membroId: "",
    isento: false,
    motivoIsencao: "",
    valorAPagar: valorPadrao,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      membroId: "",
      isento: false,
      motivoIsencao: "",
      valorAPagar: valorPadrao,
    });
  }, [valorPadrao, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.membroId) {
      return;
    }

    if (formData.isento && !formData.motivoIsencao) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Erro ao adicionar participante:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      membroId: "",
      isento: false,
      motivoIsencao: "",
      valorAPagar: valorPadrao,
    });
    onClose();
  };

  const handleIsentoChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isento: checked,
      motivoIsencao: checked ? formData.motivoIsencao : "",
      valorAPagar: checked ? 0 : valorPadrao,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adicionar Participante"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Membro */}
        <div>
          <label
            htmlFor="membroId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Membro <span className="text-red-500">*</span>
          </label>
          <select
            id="membroId"
            value={formData.membroId}
            onChange={(e) =>
              setFormData({ ...formData, membroId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Selecione um membro</option>
            {membrosDisponiveis.map((membro) => (
              <option key={membro.id} value={membro.id}>
                {membro.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Isento */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isento"
            checked={formData.isento}
            onChange={(e) => handleIsentoChange(e.target.checked)}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label
            htmlFor="isento"
            className="text-sm font-medium text-gray-700"
          >
            Isento
          </label>
        </div>

        {/* Motivo da Isenção */}
        {formData.isento && (
          <div>
            <label
              htmlFor="motivoIsencao"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Motivo da Isenção <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="motivoIsencao"
              value={formData.motivoIsencao || ""}
              onChange={(e) =>
                setFormData({ ...formData, motivoIsencao: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Situação financeira"
              required
            />
          </div>
        )}

        {/* Valor a Pagar */}
        <div>
          <label
            htmlFor="valorAPagar"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Valor a Pagar
          </label>
          <input
            type="number"
            id="valorAPagar"
            value={formData.valorAPagar || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            placeholder="R$ 0,00"
            step="0.01"
            min="0"
            disabled
          />
        </div>

        <ModalFooter className="flex-col-reverse sm:flex-row">
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Salvando..." : "Adicionar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
