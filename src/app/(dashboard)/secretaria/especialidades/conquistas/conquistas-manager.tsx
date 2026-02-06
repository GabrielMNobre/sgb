"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package, Trash2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  MembroEspecialidadeComRelacoes,
  MembroEspecialidadeFormData,
  Especialidade,
} from "@/types/especialidade";
import type { Unidade } from "@/types/unidade";
import type { Membro } from "@/types/membro";
import {
  registrarConquistaAction,
  marcarEntregaAction,
  removerConquistaAction,
} from "../actions";

interface ConquistasManagerProps {
  conquistas: MembroEspecialidadeComRelacoes[];
  unidades: Unidade[];
  especialidades: Especialidade[];
  membros: Membro[];
}

export function ConquistasManager({
  conquistas,
  unidades,
  especialidades,
  membros,
}: ConquistasManagerProps) {
  const [unidadeFiltro, setUnidadeFiltro] = useState("");
  const [buscaMembro, setBuscaMembro] = useState("");
  const [buscaEspecialidade, setBuscaEspecialidade] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entregaDialog, setEntregaDialog] = useState<{
    isOpen: boolean;
    conquista: MembroEspecialidadeComRelacoes | null;
    dataEntrega: string;
  }>({
    isOpen: false,
    conquista: null,
    dataEntrega: new Date().toISOString().split("T")[0],
  });
  const [removeDialog, setRemoveDialog] = useState<{
    isOpen: boolean;
    conquista: MembroEspecialidadeComRelacoes | null;
  }>({ isOpen: false, conquista: null });

  // Form state for nova conquista
  const [formData, setFormData] = useState<MembroEspecialidadeFormData>({
    membroId: "",
    especialidadeId: "",
    dataConclusao: new Date().toISOString().split("T")[0],
    entregue: false,
    dataEntrega: "",
    observacao: "",
  });

  const router = useRouter();
  const { success, error } = useToast();

  const unidadeOptions = [
    { value: "", label: "Todas as unidades" },
    ...unidades.map((u) => ({ value: u.id, label: u.nome })),
  ];

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "pendente", label: "Pendente" },
    { value: "entregue", label: "Entregue" },
  ];

  // Filter conquistas
  const conquistasFiltradas = conquistas.filter((c) => {
    if (unidadeFiltro && c.membro?.unidadeId !== unidadeFiltro) return false;
    if (
      buscaMembro &&
      !c.membro?.nome.toLowerCase().includes(buscaMembro.toLowerCase())
    )
      return false;
    if (
      buscaEspecialidade &&
      !c.especialidade.nome
        .toLowerCase()
        .includes(buscaEspecialidade.toLowerCase())
    )
      return false;
    if (statusFiltro === "pendente" && c.entregue) return false;
    if (statusFiltro === "entregue" && !c.entregue) return false;
    return true;
  });

  // Especialidades available for selected membro (active ones not already conquered)
  const especialidadesDisponiveis = formData.membroId
    ? especialidades.filter(
        (esp) =>
          esp.ativa &&
          !conquistas.some(
            (c) =>
              c.membroId === formData.membroId &&
              c.especialidadeId === esp.id
          )
      )
    : especialidades.filter((esp) => esp.ativa);

  const membroOptions = [
    { value: "", label: "Selecione um membro" },
    ...membros.map((m) => ({ value: m.id, label: m.nome.toUpperCase() })),
  ];

  const especialidadeOptions = [
    { value: "", label: "Selecione uma especialidade" },
    ...especialidadesDisponiveis.map((e) => ({
      value: e.id,
      label: `${e.nome} (${e.categoria})`,
    })),
  ];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const resetForm = () => {
    setFormData({
      membroId: "",
      especialidadeId: "",
      dataConclusao: new Date().toISOString().split("T")[0],
      entregue: false,
      dataEntrega: "",
      observacao: "",
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.membroId || !formData.especialidadeId || !formData.dataConclusao) {
      error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit: MembroEspecialidadeFormData = {
        ...formData,
        dataEntrega: formData.entregue ? formData.dataEntrega : undefined,
      };
      await registrarConquistaAction(dataToSubmit);
      success("Conquista registrada com sucesso");
      handleCloseModal();
      router.refresh();
    } catch (err) {
      error("Erro ao registrar conquista");
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarEntrega = async () => {
    if (!entregaDialog.conquista) return;
    setLoading(true);
    try {
      await marcarEntregaAction(
        entregaDialog.conquista.id,
        entregaDialog.dataEntrega
      );
      success("Entrega registrada com sucesso");
      router.refresh();
    } catch (err) {
      error("Erro ao registrar entrega");
    } finally {
      setLoading(false);
      setEntregaDialog({
        isOpen: false,
        conquista: null,
        dataEntrega: new Date().toISOString().split("T")[0],
      });
    }
  };

  const handleRemover = async () => {
    if (!removeDialog.conquista) return;
    setLoading(true);
    try {
      await removerConquistaAction(removeDialog.conquista.id);
      success("Conquista removida com sucesso");
      router.refresh();
    } catch (err) {
      error("Erro ao remover conquista");
    } finally {
      setLoading(false);
      setRemoveDialog({ isOpen: false, conquista: null });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with button */}
      <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {conquistas.length} conquista(s) registrada(s)
        </h2>
        <Button onClick={handleOpenModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conquista
        </Button>
      </div>

      {/* Filters */}
      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          value={unidadeFiltro}
          onChange={(e) => setUnidadeFiltro(e.target.value)}
          options={unidadeOptions}
        />
        <SearchInput
          value={buscaMembro}
          onChange={(e) => setBuscaMembro(e.target.value)}
          onClear={() => setBuscaMembro("")}
          placeholder="Buscar por membro..."
        />
        <SearchInput
          value={buscaEspecialidade}
          onChange={(e) => setBuscaEspecialidade(e.target.value)}
          onClear={() => setBuscaEspecialidade("")}
          placeholder="Buscar por especialidade..."
        />
        <Select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          options={statusOptions}
        />
      </div>

      {/* Table or Empty State */}
      {conquistas.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Nenhuma conquista registrada"
          description="Registre a primeira conquista de especialidade clicando no botão acima"
        />
      ) : conquistasFiltradas.length === 0 ? (
        <EmptyState
          title="Nenhuma conquista encontrada"
          description="Ajuste os filtros para encontrar conquistas"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conclusão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conquistasFiltradas.map((conquista) => (
              <TableRow key={conquista.id}>
                <TableCell className="font-medium">
                  {conquista.membro?.nome || "-"}
                </TableCell>
                <TableCell>
                  {conquista.membro?.unidadeNome || "-"}
                </TableCell>
                <TableCell>{conquista.especialidade.nome}</TableCell>
                <TableCell>{conquista.especialidade.categoria}</TableCell>
                <TableCell>{formatDate(conquista.dataConclusao)}</TableCell>
                <TableCell>
                  {conquista.entregue ? (
                    <Badge variant="success">Entregue</Badge>
                  ) : (
                    <Badge variant="warning">Pendente</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!conquista.entregue && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEntregaDialog({
                            isOpen: true,
                            conquista,
                            dataEntrega: new Date()
                              .toISOString()
                              .split("T")[0],
                          })
                        }
                        title="Marcar como entregue"
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setRemoveDialog({ isOpen: true, conquista })
                      }
                      title="Remover conquista"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal Nova Conquista */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="Nova Conquista"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membro *
            </label>
            <Select
              value={formData.membroId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  membroId: e.target.value,
                  especialidadeId: "",
                }))
              }
              options={membroOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidade *
            </label>
            <Select
              value={formData.especialidadeId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  especialidadeId: e.target.value,
                }))
              }
              options={especialidadeOptions}
              disabled={!formData.membroId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Conclusão *
            </label>
            <Input
              type="date"
              value={formData.dataConclusao}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dataConclusao: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="entregue"
              checked={formData.entregue}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  entregue: e.target.checked,
                  dataEntrega: e.target.checked
                    ? prev.dataEntrega || new Date().toISOString().split("T")[0]
                    : "",
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="entregue" className="text-sm font-medium text-gray-700">
              Já foi entregue
            </label>
          </div>

          {formData.entregue && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Entrega
              </label>
              <Input
                type="date"
                value={formData.dataEntrega || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dataEntrega: e.target.value,
                  }))
                }
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observação
            </label>
            <Textarea
              value={formData.observacao || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  observacao: e.target.value,
                }))
              }
              placeholder="Observações sobre a conquista..."
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={handleCloseModal} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Registrar Conquista"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Dialog de entrega */}
      <ConfirmDialog
        isOpen={entregaDialog.isOpen}
        onClose={() =>
          setEntregaDialog({
            isOpen: false,
            conquista: null,
            dataEntrega: new Date().toISOString().split("T")[0],
          })
        }
        onConfirm={handleMarcarEntrega}
        title="Registrar Entrega"
        message={
          <div className="space-y-4">
            <p>
              Deseja registrar a entrega da especialidade{" "}
              <strong>{entregaDialog.conquista?.especialidade.nome}</strong> para{" "}
              <strong>{entregaDialog.conquista?.membro?.nome}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Entrega
              </label>
              <input
                type="date"
                value={entregaDialog.dataEntrega}
                onChange={(e) =>
                  setEntregaDialog((prev) => ({
                    ...prev,
                    dataEntrega: e.target.value,
                  }))
                }
                className="input"
              />
            </div>
          </div>
        }
        confirmText="Confirmar Entrega"
        variant="warning"
        loading={loading}
      />

      {/* Dialog de remoção */}
      <ConfirmDialog
        isOpen={removeDialog.isOpen}
        onClose={() => setRemoveDialog({ isOpen: false, conquista: null })}
        onConfirm={handleRemover}
        title="Remover Conquista"
        message={
          <p>
            Tem certeza que deseja remover a conquista da especialidade{" "}
            <strong>{removeDialog.conquista?.especialidade.nome}</strong> do membro{" "}
            <strong>{removeDialog.conquista?.membro?.nome}</strong>? Esta ação não
            pode ser desfeita.
          </p>
        }
        confirmText="Remover"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
