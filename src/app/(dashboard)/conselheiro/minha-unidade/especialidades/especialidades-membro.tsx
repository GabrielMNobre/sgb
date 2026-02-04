"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Plus, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { MembroEspecialidadeForm } from "@/components/forms/membro-especialidade-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Especialidade, MembroEspecialidadeComRelacoes, MembroEspecialidadeFormData } from "@/types/especialidade";
import { registrarConquistaAction, marcarEntregaAction, removerConquistaAction } from "./actions";

interface MembroComEspecialidades {
  id: string;
  nome: string;
  classeNome?: string;
  totalEspecialidades: number;
}

interface EspecialidadesMembroProps {
  membros: MembroComEspecialidades[];
  especialidades: Especialidade[];
  getEspecialidadesDoMembro: (membroId: string) => Promise<MembroEspecialidadeComRelacoes[]>;
}

export function EspecialidadesMembro({
  membros,
  especialidades,
  getEspecialidadesDoMembro,
}: EspecialidadesMembroProps) {
  const [selectedMembro, setSelectedMembro] = useState<MembroComEspecialidades | null>(null);
  const [membroEspecialidades, setMembroEspecialidades] = useState<MembroEspecialidadeComRelacoes[]>([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    especialidade: MembroEspecialidadeComRelacoes | null;
  }>({ isOpen: false, especialidade: null });
  const [entregaDialog, setEntregaDialog] = useState<{
    isOpen: boolean;
    especialidade: MembroEspecialidadeComRelacoes | null;
    dataEntrega: string;
  }>({ isOpen: false, especialidade: null, dataEntrega: new Date().toISOString().split("T")[0] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const handleViewEspecialidades = async (membro: MembroComEspecialidades) => {
    setSelectedMembro(membro);
    setLoadingEspecialidades(true);
    setIsModalOpen(true);
    try {
      const especialidadesData = await getEspecialidadesDoMembro(membro.id);
      setMembroEspecialidades(especialidadesData);
    } catch (err) {
      error("Erro ao carregar especialidades");
    } finally {
      setLoadingEspecialidades(false);
    }
  };

  const handleAddEspecialidade = async (data: MembroEspecialidadeFormData) => {
    await registrarConquistaAction(data);
    // Refresh the list
    if (selectedMembro) {
      const especialidadesData = await getEspecialidadesDoMembro(selectedMembro.id);
      setMembroEspecialidades(especialidadesData);
    }
    setIsAddModalOpen(false);
    router.refresh();
  };

  const handleMarcarEntrega = async () => {
    if (!entregaDialog.especialidade) return;
    setLoading(true);
    try {
      await marcarEntregaAction(entregaDialog.especialidade.id, entregaDialog.dataEntrega);
      success("Entrega registrada com sucesso");
      // Refresh the list
      if (selectedMembro) {
        const especialidadesData = await getEspecialidadesDoMembro(selectedMembro.id);
        setMembroEspecialidades(especialidadesData);
      }
      router.refresh();
    } catch (err) {
      error("Erro ao registrar entrega");
    } finally {
      setLoading(false);
      setEntregaDialog({ isOpen: false, especialidade: null, dataEntrega: new Date().toISOString().split("T")[0] });
    }
  };

  const handleRemoverConquista = async () => {
    if (!confirmDialog.especialidade) return;
    setLoading(true);
    try {
      await removerConquistaAction(confirmDialog.especialidade.id);
      success("Especialidade removida com sucesso");
      // Refresh the list
      if (selectedMembro) {
        const especialidadesData = await getEspecialidadesDoMembro(selectedMembro.id);
        setMembroEspecialidades(especialidadesData);
      }
      router.refresh();
    } catch (err) {
      error("Erro ao remover especialidade");
    } finally {
      setLoading(false);
      setConfirmDialog({ isOpen: false, especialidade: null });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Membro</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead className="text-center">Especialidades</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {membros.map((membro) => (
            <TableRow key={membro.id}>
              <TableCell className="font-medium">{membro.nome}</TableCell>
              <TableCell>
                {membro.classeNome ? (
                  <Badge variant="outline">{membro.classeNome}</Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="default">{membro.totalEspecialidades}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewEspecialidades(membro)}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Gerenciar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de especialidades do membro */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Especialidades de ${selectedMembro?.nome || ""}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Especialidade
            </Button>
          </div>

          {loadingEspecialidades ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : membroEspecialidades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma especialidade conquistada ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Conclusão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membroEspecialidades.map((esp) => (
                  <TableRow key={esp.id}>
                    <TableCell className="font-medium">{esp.especialidade.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {esp.especialidade.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(esp.dataConclusao)}</TableCell>
                    <TableCell>
                      {esp.entregue ? (
                        <Badge variant="success">Entregue</Badge>
                      ) : (
                        <Badge variant="warning">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!esp.entregue && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setEntregaDialog({
                                isOpen: true,
                                especialidade: esp,
                                dataEntrega: new Date().toISOString().split("T")[0],
                              })
                            }
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDialog({ isOpen: true, especialidade: esp })}
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
        </div>
      </Modal>

      {/* Modal de adicionar especialidade */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Adicionar Especialidade"
      >
        {selectedMembro && (
          <MembroEspecialidadeForm
            membroId={selectedMembro.id}
            membroNome={selectedMembro.nome}
            especialidades={especialidades}
            especialidadesExistentes={membroEspecialidades.map((e) => e.especialidadeId)}
            onSubmit={handleAddEspecialidade}
            onCancel={() => setIsAddModalOpen(false)}
          />
        )}
      </Modal>

      {/* Dialog de marcar entrega */}
      <ConfirmDialog
        isOpen={entregaDialog.isOpen}
        onClose={() => setEntregaDialog({ isOpen: false, especialidade: null, dataEntrega: new Date().toISOString().split("T")[0] })}
        onConfirm={handleMarcarEntrega}
        title="Marcar Entrega"
        message={
          <div className="space-y-4">
            <p>Deseja marcar a entrega da especialidade <strong>{entregaDialog.especialidade?.especialidade.nome}</strong>?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Entrega
              </label>
              <input
                type="date"
                value={entregaDialog.dataEntrega}
                onChange={(e) => setEntregaDialog((prev) => ({ ...prev, dataEntrega: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        }
        confirmText="Confirmar Entrega"
        variant="warning"
        loading={loading}
      />

      {/* Dialog de remover */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, especialidade: null })}
        onConfirm={handleRemoverConquista}
        title="Remover Especialidade"
        message={`Deseja remover a especialidade "${confirmDialog.especialidade?.especialidade.nome}" deste membro? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
