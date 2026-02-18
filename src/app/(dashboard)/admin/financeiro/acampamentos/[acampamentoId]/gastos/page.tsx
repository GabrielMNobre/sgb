"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GastosTable } from "@/components/tables/gastos-table";
import { GastoModal } from "@/components/forms/gasto-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, ArrowLeft, ShoppingCart } from "lucide-react";
import type { Acampamento } from "@/types/acampamento";
import type { GastoComEvento, GastoFormData } from "@/types/gasto";
import type { Evento } from "@/types/evento";
import { criarGastoAcampamentoAction, excluirGastoAcampamentoAction } from "../actions";

export default function GastosAcampamentoPage({
  params,
}: {
  params: Promise<{ acampamentoId: string }>;
}) {
  const { acampamentoId } = use(params);
  const router = useRouter();
  const [acampamento, setAcampamento] = useState<Acampamento | null>(null);
  const [gastos, setGastos] = useState<GastoComEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoSelecionado, setGastoSelecionado] = useState<(GastoFormData & { id?: string }) | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gastoParaExcluir, setGastoParaExcluir] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [acampamentoId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const acampRes = await fetch(`/api/acampamentos/${acampamentoId}`);
      if (acampRes.ok) {
        const acampData = await acampRes.json();
        setAcampamento(acampData.acampamento || null);
        if (acampData.acampamento?.eventoId) {
          const gastosRes = await fetch(`/api/gastos?eventoId=${acampData.acampamento.eventoId}`);
          if (gastosRes.ok) {
            const gastosData = await gastosRes.json();
            setGastos(Array.isArray(gastosData) ? gastosData : []);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoGasto = () => { setGastoSelecionado(undefined); setModalOpen(true); };

  const handleEditarGasto = (gasto: GastoComEvento) => {
    setGastoSelecionado({
      id: gasto.id,
      eventoId: gasto.eventoId,
      data: new Date(gasto.data).toISOString().split("T")[0],
      descricao: gasto.descricao,
      valor: gasto.valor,
      observacao: gasto.observacao,
    });
    setModalOpen(true);
  };

  const handleSalvarGasto = async (data: GastoFormData) => {
    await criarGastoAcampamentoAction(acampamentoId, data);
    await carregarDados();
  };

  const handleExcluirGasto = (id: string) => { setGastoParaExcluir(id); setDeleteDialogOpen(true); };

  const confirmarExclusao = async () => {
    if (gastoParaExcluir) {
      await excluirGastoAcampamentoAction(acampamentoId, gastoParaExcluir);
      await carregarDados();
    }
    setDeleteDialogOpen(false);
    setGastoParaExcluir(null);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const isFinalizado = acampamento?.status === "finalizado";
  const totalGastos = gastos.reduce((sum, g) => sum + g.valor, 0);
  const eventosParaModal: Evento[] = acampamento?.eventoId
    ? [{ id: acampamento.eventoId, nome: acampamento.nome, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() }]
    : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/financeiro/acampamentos/${acampamentoId}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gastos</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{acampamento?.nome}</p>
          </div>
        </div>
        {!isFinalizado && (
          <Button variant="primary" onClick={handleNovoGasto} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Gasto
          </Button>
        )}
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Gastos</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{formatCurrency(totalGastos)}</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12"><p className="text-gray-500">Carregando...</p></div>
          ) : (
            <GastosTable gastos={gastos} onEdit={!isFinalizado ? handleEditarGasto : () => {}} onDelete={!isFinalizado ? handleExcluirGasto : () => {}} />
          )}
        </div>
      </Card>

      <GastoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} eventos={eventosParaModal} gastoInicial={gastoSelecionado} eventoIdPadrao={acampamento?.eventoId} onSubmit={handleSalvarGasto} />

      <ConfirmDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={confirmarExclusao} title="Excluir Gasto" message="Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita." confirmText="Excluir" variant="danger" />
    </div>
  );
}
