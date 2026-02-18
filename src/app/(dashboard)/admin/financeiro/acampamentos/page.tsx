"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AcampamentosTable } from "@/components/tables/acampamentos-table";
import { AcampamentosFilters } from "@/components/forms/acampamentos-filters";
import { AcampamentoModal } from "@/components/forms/acampamento-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loading } from "@/components/ui/loading";
import { Plus, Tent } from "lucide-react";
import type {
  Acampamento,
  FiltrosAcampamento,
  AcampamentoFormData,
} from "@/types/acampamento";
import {
  criarAcampamentoAction,
  atualizarAcampamentoAction,
  excluirAcampamentoAction,
} from "./actions";

export default function AcampamentosPage() {
  const router = useRouter();
  const [acampamentos, setAcampamentos] = useState<Acampamento[]>([]);
  const [filtros, setFiltros] = useState<FiltrosAcampamento>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [acampamentoSelecionado, setAcampamentoSelecionado] =
    useState<Acampamento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [acampamentoParaExcluir, setAcampamentoParaExcluir] = useState<
    string | null
  >(null);

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.status) params.set("status", filtros.status);
      if (filtros.ano) params.set("ano", String(filtros.ano));

      const response = await fetch(`/api/acampamentos?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAcampamentos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar acampamentos:", error);
      setAcampamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoAcampamento = () => {
    setAcampamentoSelecionado(null);
    setModalOpen(true);
  };

  const handleEditarAcampamento = (acampamento: Acampamento) => {
    setAcampamentoSelecionado(acampamento);
    setModalOpen(true);
  };

  const handleSalvarAcampamento = async (
    data: AcampamentoFormData,
    id?: string
  ) => {
    if (id) {
      await atualizarAcampamentoAction(id, data);
    } else {
      await criarAcampamentoAction(data);
    }
    await carregarDados();
  };

  const handleExcluirAcampamento = (id: string) => {
    setAcampamentoParaExcluir(id);
    setDeleteDialogOpen(true);
  };

  const confirmarExclusao = async () => {
    if (acampamentoParaExcluir) {
      const result = await excluirAcampamentoAction(acampamentoParaExcluir);
      if (!result.success && result.error) {
        alert(result.error);
      }
      await carregarDados();
    }
    setDeleteDialogOpen(false);
    setAcampamentoParaExcluir(null);
  };

  const handleVerAcampamento = (id: string) => {
    router.push(`/admin/financeiro/acampamentos/${id}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Acampamentos</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerencie os acampamentos do clube
          </p>
        </div>
        <Button variant="primary" onClick={handleNovoAcampamento} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Acampamento
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {acampamentos.length}
                </p>
              </div>
              <Tent className="w-10 h-10 text-primary opacity-20" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Abertos</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
              {acampamentos.filter((a) => a.status === "aberto").length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Finalizados</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-500 mt-1">
              {acampamentos.filter((a) => a.status === "finalizado").length}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <AcampamentosFilters filtros={filtros} onFiltrosChange={setFiltros} />
        </div>
      </Card>

      <Card>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loading size="lg" />
              <p className="text-gray-500 mt-3">Carregando...</p>
            </div>
          ) : (
            <AcampamentosTable
              acampamentos={acampamentos}
              onEdit={handleEditarAcampamento}
              onDelete={handleExcluirAcampamento}
              onView={handleVerAcampamento}
            />
          )}
        </div>
      </Card>

      <AcampamentoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        acampamentoInicial={
          acampamentoSelecionado
            ? {
                id: acampamentoSelecionado.id,
                nome: acampamentoSelecionado.nome,
                descricao: acampamentoSelecionado.descricao,
                dataInicio: new Date(acampamentoSelecionado.dataInicio)
                  .toISOString()
                  .split("T")[0],
                dataFim: new Date(acampamentoSelecionado.dataFim)
                  .toISOString()
                  .split("T")[0],
                valorPorPessoa: acampamentoSelecionado.valorPorPessoa,
              }
            : undefined
        }
        onSubmit={handleSalvarAcampamento}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmarExclusao}
        title="Excluir Acampamento"
        message="Tem certeza que deseja excluir este acampamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}
