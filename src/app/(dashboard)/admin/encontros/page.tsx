"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EncontrosTable } from "@/components/tables/encontros-table";
import { EncontrosFilters } from "@/components/forms/encontros-filters";
import { EncontroModal } from "@/components/forms/encontro-modal";
import { Plus, Calendar } from "lucide-react";
import type { Encontro, FiltrosEncontro, EncontroFormData } from "@/types/encontro";
import {
  criarEncontroAction,
  atualizarEncontroAction,
  excluirEncontroAction,
  iniciarEncontroAction,
  finalizarEncontroAction,
} from "./actions";

export default function AdminEncontrosPage() {
  const router = useRouter();
  const [encontros, setEncontros] = useState<Encontro[]>([]);
  const [filtros, setFiltros] = useState<FiltrosEncontro>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [encontroSelecionado, setEncontroSelecionado] = useState<Encontro | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [startDialog, setStartDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [finishDialog, setFinishDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.status) params.set("status", filtros.status);
      if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.set("dataFim", filtros.dataFim);

      const response = await fetch(`/api/encontros?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEncontros(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar encontros:", error);
      setEncontros([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    setEncontroSelecionado(null);
    setModalOpen(true);
  };

  const handleEditar = (encontro: Encontro) => {
    setEncontroSelecionado(encontro);
    setModalOpen(true);
  };

  const handleSalvar = async (data: EncontroFormData, id?: string) => {
    if (id) {
      const result = await atualizarEncontroAction(id, data);
      await carregarDados();
      return result;
    } else {
      const result = await criarEncontroAction(data);
      await carregarDados();
      return result;
    }
  };

  const confirmarExclusao = async () => {
    if (deleteDialog.id) {
      const result = await excluirEncontroAction(deleteDialog.id);
      if (!result.success && result.error) {
        alert(result.error);
      }
      await carregarDados();
    }
    setDeleteDialog({ isOpen: false, id: null });
  };

  const confirmarIniciar = async () => {
    if (startDialog.id) {
      await iniciarEncontroAction(startDialog.id);
      await carregarDados();
    }
    setStartDialog({ isOpen: false, id: null });
  };

  const confirmarFinalizar = async () => {
    if (finishDialog.id) {
      await finalizarEncontroAction(finishDialog.id);
      await carregarDados();
    }
    setFinishDialog({ isOpen: false, id: null });
  };

  const totalAgendados = encontros.filter((e) => e.status === "agendado").length;
  const totalEmAndamento = encontros.filter((e) => e.status === "em_andamento").length;
  const totalFinalizados = encontros.filter((e) => e.status === "finalizado").length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Encontros</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerencie os encontros semanais do clube
          </p>
        </div>
        <Button onClick={handleNovo} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Encontro
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <div className="p-4 sm:p-6">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {encontros.length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4 sm:p-6">
            <p className="text-sm text-gray-600">Agendados</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
              {totalAgendados}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4 sm:p-6">
            <p className="text-sm text-gray-600">Em Andamento</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">
              {totalEmAndamento}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4 sm:p-6">
            <p className="text-sm text-gray-600">Finalizados</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
              {totalFinalizados}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 sm:p-6">
          <EncontrosFilters filtros={filtros} onFiltrosChange={setFiltros} />
        </div>
      </Card>

      <Card>
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <Calendar className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <EncontrosTable
              encontros={encontros}
              onView={(id) => router.push(`/admin/encontros/${id}`)}
              onEdit={handleEditar}
              onStart={(id) => setStartDialog({ isOpen: true, id })}
              onFinish={(id) => setFinishDialog({ isOpen: true, id })}
              onDelete={(id) => setDeleteDialog({ isOpen: true, id })}
            />
          )}
        </div>
      </Card>

      <EncontroModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        encontroInicial={
          encontroSelecionado
            ? {
                id: encontroSelecionado.id,
                data: encontroSelecionado.data?.split("T")[0] || encontroSelecionado.data,
                descricao: encontroSelecionado.descricao,
              }
            : undefined
        }
        onSubmit={handleSalvar}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={confirmarExclusao}
        title="Excluir Encontro"
        message="Tem certeza que deseja excluir este encontro? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={startDialog.isOpen}
        onClose={() => setStartDialog({ isOpen: false, id: null })}
        onConfirm={confirmarIniciar}
        title="Iniciar Encontro"
        message="Ao iniciar o encontro, a chamada será liberada para os conselheiros. Deseja continuar?"
        confirmText="Iniciar"
        variant="warning"
      />

      <ConfirmDialog
        isOpen={finishDialog.isOpen}
        onClose={() => setFinishDialog({ isOpen: false, id: null })}
        onConfirm={confirmarFinalizar}
        title="Finalizar Encontro"
        message="Ao finalizar o encontro, a chamada será encerrada e não poderá mais ser editada. Deseja continuar?"
        confirmText="Finalizar"
        variant="warning"
      />
    </div>
  );
}
