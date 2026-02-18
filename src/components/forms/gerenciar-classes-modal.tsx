"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import type {
  Classe,
  HistoricoClasseComRelacoes,
  HistoricoClasseFormData,
} from "@/types/membro";
import { formatDate } from "@/lib/utils/date";

interface GerenciarClassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  membroId: string;
  membroNome: string;
  membroTipo: "desbravador" | "diretoria";
  classes: Classe[];
  historico: HistoricoClasseComRelacoes[];
  onAdd: (data: HistoricoClasseFormData) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function GerenciarClassesModal({
  isOpen,
  onClose,
  membroId,
  membroNome,
  membroTipo,
  classes,
  historico,
  onAdd,
  onRemove,
}: GerenciarClassesModalProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  // Form state
  const [classeId, setClasseId] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [dataInvestidura, setDataInvestidura] = useState("");
  const [observacao, setObservacao] = useState("");

  // Sort historico by ano desc, then classe.ordem desc
  const historicoOrdenado = [...historico].sort((a, b) => {
    if (b.ano !== a.ano) return b.ano - a.ano;
    return b.classe.ordem - a.classe.ordem;
  });

  // Filter classes by membroTipo
  const classesOptions = classes
    .filter((c) => {
      if (membroTipo === "desbravador") return c.tipo === "desbravador";
      return true; // diretoria can see all
    })
    .map((c) => ({ value: c.id, label: c.nome }));

  function resetForm() {
    setClasseId("");
    setAno(new Date().getFullYear());
    setDataInvestidura("");
    setObservacao("");
  }

  function handleOpenAddModal() {
    resetForm();
    setAddModalOpen(true);
  }

  function handleCloseAddModal() {
    setAddModalOpen(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classeId) return;

    setLoading(true);
    try {
      await onAdd({
        classeId,
        ano,
        dataInvestidura: dataInvestidura || undefined,
        observacao: observacao || undefined,
      });
      success("Classe adicionada ao histórico");
      handleCloseAddModal();
      router.refresh();
    } catch (err) {
      error(
        err instanceof Error ? err.message : "Erro ao adicionar classe"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmRemove() {
    if (!removeId) return;

    setRemoveLoading(true);
    try {
      await onRemove(removeId);
      success("Classe removida do histórico");
      setRemoveId(null);
      router.refresh();
    } catch (err) {
      error(
        err instanceof Error ? err.message : "Erro ao remover classe"
      );
    } finally {
      setRemoveLoading(false);
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Histórico de Classes - ${membroNome}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Gerencie as classes conquistadas por este membro. A classe atual será automaticamente atualizada para a de maior ordem.
            </p>
            <Button size="sm" onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {historicoOrdenado.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Nenhuma classe registrada"
              description="Adicione classes ao histórico deste membro."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Classe
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Tipo
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Ano
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Data Investidura
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Observação
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historicoOrdenado.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2 px-3 font-medium text-gray-900">
                        {item.classe.nome}
                      </td>
                      <td className="py-2 px-3">
                        <Badge
                          variant={
                            item.classe.tipo === "desbravador"
                              ? "default"
                              : "outline"
                          }
                        >
                          {item.classe.tipo === "desbravador"
                            ? "Desbravador"
                            : "Liderança"}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-gray-700">{item.ano}</td>
                      <td className="py-2 px-3 text-gray-700">
                        {formatDate(item.dataInvestidura)}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {item.observacao || "-"}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoveId(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={handleCloseAddModal}
        title="Adicionar Classe"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Classe *</label>
            <Select
              value={classeId}
              onChange={(e) => setClasseId(e.target.value)}
              options={classesOptions}
              placeholder="Selecione uma classe"
            />
          </div>

          <div>
            <label className="label">Ano *</label>
            <Input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              min={2000}
              max={2100}
            />
          </div>

          <div>
            <label className="label">Data de Investidura</label>
            <Input
              type="date"
              value={dataInvestidura}
              onChange={(e) => setDataInvestidura(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Observação</label>
            <Textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Observação opcional"
            />
          </div>

          <ModalFooter className="flex-col-reverse sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseAddModal}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !classeId} className="w-full sm:w-auto">
              {loading ? <><Loading size="sm" className="mr-2" />Adicionando...</> : "Adicionar"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Remove Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!removeId}
        onClose={() => setRemoveId(null)}
        onConfirm={handleConfirmRemove}
        title="Remover Classe"
        message="Tem certeza que deseja remover esta classe do histórico? Esta ação não pode ser desfeita."
        confirmText="Remover"
        variant="danger"
        loading={removeLoading}
      />
    </>
  );
}
