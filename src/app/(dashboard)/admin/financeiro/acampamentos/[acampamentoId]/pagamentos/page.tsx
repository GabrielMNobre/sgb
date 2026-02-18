"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PagamentosAcampamentoTable } from "@/components/tables/pagamentos-acampamento-table";
import { PagamentoAcampamentoModal } from "@/components/forms/pagamento-acampamento-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loading } from "@/components/ui/loading";
import { Plus, ArrowLeft, DollarSign } from "lucide-react";
import type {
  Acampamento,
  PagamentoComParticipante,
  ParticipanteComPagamentos,
  PagamentoFormData,
  FiltrosPagamento,
} from "@/types/acampamento";
import { criarPagamentoAction, excluirPagamentoAction } from "../actions";

export default function PagamentosPage({
  params,
}: {
  params: Promise<{ acampamentoId: string }>;
}) {
  const { acampamentoId } = use(params);
  const router = useRouter();
  const [acampamento, setAcampamento] = useState<Acampamento | null>(null);
  const [pagamentos, setPagamentos] = useState<PagamentoComParticipante[]>([]);
  const [participantes, setParticipantes] = useState<ParticipanteComPagamentos[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pagamentoParaExcluir, setPagamentoParaExcluir] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosPagamento>({});

  useEffect(() => {
    carregarDados();
  }, [acampamentoId, filtros]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filtros.dataInicio) queryParams.set("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) queryParams.set("dataFim", filtros.dataFim);
      if (filtros.participanteId) queryParams.set("participanteId", filtros.participanteId);

      const [acampRes, pagRes, partRes] = await Promise.all([
        fetch(`/api/acampamentos/${acampamentoId}`),
        fetch(`/api/acampamentos/${acampamentoId}/pagamentos?${queryParams}`),
        fetch(`/api/acampamentos/${acampamentoId}/participantes`),
      ]);

      if (acampRes.ok) { const d = await acampRes.json(); setAcampamento(d.acampamento || null); }
      if (pagRes.ok) { const d = await pagRes.json(); setPagamentos(Array.isArray(d) ? d : []); }
      if (partRes.ok) { const d = await partRes.json(); setParticipantes(Array.isArray(d) ? d : []); }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarPagamento = async (data: PagamentoFormData) => {
    await criarPagamentoAction(acampamentoId, data);
    await carregarDados();
  };

  const handleExcluirPagamento = (id: string) => {
    setPagamentoParaExcluir(id);
    setDeleteDialogOpen(true);
  };

  const confirmarExclusao = async () => {
    if (pagamentoParaExcluir) {
      await excluirPagamentoAction(acampamentoId, pagamentoParaExcluir);
      await carregarDados();
    }
    setDeleteDialogOpen(false);
    setPagamentoParaExcluir(null);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const isFinalizado = acampamento?.status === "finalizado";
  const totalPagamentos = pagamentos.reduce((sum, p) => sum + p.valor, 0);
  const participantesParaPagamento = participantes
    .filter((p) => p.status === "inscrito")
    .map((p) => ({ id: p.id, nome: p.membro?.nome || "—" }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/financeiro/acampamentos/${acampamentoId}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pagamentos</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{acampamento?.nome}</p>
          </div>
        </div>
        {!isFinalizado && (
          <Button variant="primary" onClick={() => setModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Registrar Pagamento
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Arrecadado</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{formatCurrency(totalPagamentos)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Número de Pagamentos</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{pagamentos.length}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input type="date" value={filtros.dataInicio || ""} onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value || undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input type="date" value={filtros.dataFim || ""} onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value || undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Participante</label>
              <select value={filtros.participanteId || ""} onChange={(e) => setFiltros({ ...filtros, participanteId: e.target.value || undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Todos</option>
                {participantesParaPagamento.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12"><Loading size="lg" /><p className="text-gray-500 mt-3">Carregando...</p></div>
          ) : (
            <PagamentosAcampamentoTable pagamentos={pagamentos} onDelete={!isFinalizado ? handleExcluirPagamento : undefined} isFinalizado={isFinalizado} />
          )}
        </div>
      </Card>

      <PagamentoAcampamentoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} participantes={participantesParaPagamento} onSubmit={handleRegistrarPagamento} />

      <ConfirmDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={confirmarExclusao} title="Excluir Pagamento" message="Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita." confirmText="Excluir" variant="danger" />
    </div>
  );
}
