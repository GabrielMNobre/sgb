"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Star, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import type { UnidadeComConselheiros } from "@/types/unidade";
import type { ConselheiroDisponivel } from "@/services/conselheiros";
import {
  vincularConselheiroAction,
  removerVinculoAction,
  definirPrincipalAction,
} from "./actions";

interface ConselheirosManagerProps {
  unidades: UnidadeComConselheiros[];
  conselheirosDisponiveis: ConselheiroDisponivel[];
}

export function ConselheirosManager({
  unidades,
  conselheirosDisponiveis,
}: ConselheirosManagerProps) {
  const [addModal, setAddModal] = useState<{
    isOpen: boolean;
    unidade: UnidadeComConselheiros | null;
  }>({ isOpen: false, unidade: null });
  const [selectedConselheiro, setSelectedConselheiro] = useState("");
  const [isPrincipal, setIsPrincipal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    unidadeId: string;
    membroId: string;
    nome: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  // Filtrar conselheiros já vinculados à unidade selecionada
  const conselheirosDisponivelParaUnidade = conselheirosDisponiveis.filter(
    (c) =>
      !addModal.unidade?.conselheiros.some((v) => v.membroId === c.id)
  );

  const handleAddConselheiro = async () => {
    if (!addModal.unidade || !selectedConselheiro) return;

    setLoading(true);
    try {
      await vincularConselheiroAction(
        addModal.unidade.id,
        selectedConselheiro,
        isPrincipal
      );
      success("Conselheiro vinculado com sucesso");
      router.refresh();
      closeAddModal();
    } catch (err) {
      error("Erro ao vincular conselheiro");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConselheiro = async () => {
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await removerVinculoAction(confirmDelete.unidadeId, confirmDelete.membroId);
      success("Vínculo removido com sucesso");
      router.refresh();
    } catch (err) {
      error("Erro ao remover vínculo");
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  const handleSetPrincipal = async (unidadeId: string, membroId: string) => {
    setLoading(true);
    try {
      await definirPrincipalAction(unidadeId, membroId);
      success("Conselheiro principal definido com sucesso");
      router.refresh();
    } catch (err) {
      error("Erro ao definir conselheiro principal");
    } finally {
      setLoading(false);
    }
  };

  const closeAddModal = () => {
    setAddModal({ isOpen: false, unidade: null });
    setSelectedConselheiro("");
    setIsPrincipal(false);
  };

  if (unidades.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhuma unidade ativa"
        description="Crie unidades primeiro para poder vincular conselheiros"
      />
    );
  }

  if (conselheirosDisponiveis.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum membro da diretoria disponível"
        description="É necessário cadastrar membros do tipo diretoria para vincular às unidades"
      />
    );
  }

  return (
    <div className="space-y-6">
      {unidades.map((unidade) => (
        <div
          key={unidade.id}
          className="border rounded-lg overflow-hidden"
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: unidade.corPrimaria }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: unidade.corSecundaria }}
              />
              <h3 className="font-semibold text-white">{unidade.nome}</h3>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAddModal({ isOpen: true, unidade })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          <div className="p-4">
            {unidade.conselheiros.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum conselheiro vinculado
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {unidade.conselheiros.map((vinculo) => (
                  <div
                    key={vinculo.id}
                    className="flex items-center gap-2 bg-gray-100 rounded-full pl-3 pr-2 py-1"
                  >
                    <span className="text-sm">{vinculo.membro.nome}</span>
                    {vinculo.principal && (
                      <Badge variant="warning" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Principal
                      </Badge>
                    )}
                    {!vinculo.principal && (
                      <button
                        onClick={() =>
                          handleSetPrincipal(unidade.id, vinculo.membroId)
                        }
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        title="Definir como principal"
                        disabled={loading}
                      >
                        <Star className="h-3 w-3 text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setConfirmDelete({
                          isOpen: true,
                          unidadeId: unidade.id,
                          membroId: vinculo.membroId,
                          nome: vinculo.membro.nome,
                        })
                      }
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      title="Remover vínculo"
                      disabled={loading}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Modal para adicionar conselheiro */}
      <Modal
        isOpen={addModal.isOpen}
        onClose={closeAddModal}
        title={`Adicionar Conselheiro - ${addModal.unidade?.nome}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Membro da Diretoria *</label>
            <Select
              value={selectedConselheiro}
              onChange={(e) => setSelectedConselheiro(e.target.value)}
              options={conselheirosDisponivelParaUnidade.map((c) => ({
                value: c.id,
                label: c.nome,
              }))}
              placeholder="Selecione um membro da diretoria"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrincipal}
                onChange={(e) => setIsPrincipal(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Definir como conselheiro principal
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              O conselheiro principal é o responsável principal pela unidade
            </p>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={closeAddModal} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddConselheiro}
            disabled={loading || !selectedConselheiro}
          >
            {loading ? "Adicionando..." : "Adicionar"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Dialog de confirmação para remover */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleRemoveConselheiro}
        title="Remover Vínculo"
        message={`Deseja remover o vínculo de ${confirmDelete?.nome} com esta unidade?`}
        confirmText="Remover"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
