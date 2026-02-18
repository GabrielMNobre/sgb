"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PagamentoAcampamentoModal } from "@/components/forms/pagamento-acampamento-modal";
import { CancelarInscricaoModal } from "@/components/forms/cancelar-inscricao-modal";
import { PagamentosAcampamentoTable } from "@/components/tables/pagamentos-acampamento-table";
import { Loading } from "@/components/ui/loading";
import {
  ArrowLeft,
  Plus,
  XCircle,
  CheckCircle,
} from "lucide-react";
import type {
  Acampamento,
  ParticipanteComPagamentos,
  PagamentoAcampamento,
  PagamentoFormData,
} from "@/types/acampamento";
import { formatDate } from "@/lib/utils/date";
import {
  criarPagamentoAction,
  excluirPagamentoAction,
  cancelarInscricaoAction,
  marcarAutorizacaoAction,
} from "../../actions";

export default function ParticipanteDetalhePage({
  params,
}: {
  params: Promise<{ acampamentoId: string; participanteId: string }>;
}) {
  const { acampamentoId, participanteId } = use(params);
  const router = useRouter();
  const [acampamento, setAcampamento] = useState<Acampamento | null>(null);
  const [participante, setParticipante] = useState<ParticipanteComPagamentos | null>(null);
  const [pagamentos, setPagamentos] = useState<PagamentoAcampamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [cancelarModalOpen, setCancelarModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pagamentoParaExcluir, setPagamentoParaExcluir] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [acampamentoId, participanteId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [acampRes, partRes, pagRes] = await Promise.all([
        fetch(`/api/acampamentos/${acampamentoId}`),
        fetch(`/api/acampamentos/${acampamentoId}/participantes?participanteId=${participanteId}`),
        fetch(`/api/acampamentos/${acampamentoId}/pagamentos?participanteId=${participanteId}`),
      ]);

      if (acampRes.ok) {
        const acampData = await acampRes.json();
        setAcampamento(acampData.acampamento || null);
      }

      if (partRes.ok) {
        const data = await partRes.json();
        const list = Array.isArray(data) ? data : [];
        const found = list.find((p: any) => p.id === participanteId);
        setParticipante(found || null);
      }

      if (pagRes.ok) {
        const data = await pagRes.json();
        setPagamentos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarPagamento = async (data: PagamentoFormData) => {
    await criarPagamentoAction(acampamentoId, {
      ...data,
      participanteId: participanteId,
    });
    await carregarDados();
  };

  const handleExcluirPagamento = (id: string) => {
    setPagamentoParaExcluir(id);
    setDeleteDialogOpen(true);
  };

  const confirmarExclusaoPagamento = async () => {
    if (pagamentoParaExcluir) {
      await excluirPagamentoAction(acampamentoId, pagamentoParaExcluir);
      await carregarDados();
    }
    setDeleteDialogOpen(false);
    setPagamentoParaExcluir(null);
  };

  const handleCancelarInscricao = async (valorDevolvido: number) => {
    await cancelarInscricaoAction(acampamentoId, participanteId, valorDevolvido);
    await carregarDados();
  };

  const handleToggleAutorizacao = async () => {
    if (!participante) return;
    await marcarAutorizacaoAction(
      acampamentoId,
      participanteId,
      !participante.autorizacaoRecolhida
    );
    await carregarDados();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loading size="lg" />
        <p className="text-gray-500 mt-3">Carregando...</p>
      </div>
    );
  }

  if (!participante) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Participante não encontrado</p>
      </div>
    );
  }

  const isFinalizado = acampamento?.status === "finalizado";
  const isCancelado = participante.status === "cancelado";
  const isMenor = participante.membro?.tipo === "desbravador";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/tesoureiro/acampamentos/${acampamentoId}/participantes`)
            }
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {participante.membro?.nome || "—"}
              </h1>
              <Badge
                variant={
                  participante.status === "inscrito" ? "success" : "error"
                }
              >
                {participante.status === "inscrito" ? "Inscrito" : "Cancelado"}
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{acampamento?.nome}</p>
          </div>
        </div>
        {!isFinalizado && !isCancelado && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPagamentoModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Registrar Pagamento
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setCancelarModalOpen(true)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Cancelar Inscrição
            </Button>
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo</span>
                <span className="font-medium">
                  {participante.membro?.tipo
                    ? participante.membro.tipo.charAt(0).toUpperCase() +
                      participante.membro.tipo.slice(1)
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unidade</span>
                <span className="font-medium">
                  {participante.membro?.unidade?.nome || "—"}
                </span>
              </div>
              {participante.isento && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Isento</span>
                  <Badge variant="secondary">
                    {participante.motivoIsencao || "Sim"}
                  </Badge>
                </div>
              )}
              {isMenor && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Autorização</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        participante.autorizacaoRecolhida ? "success" : "warning"
                      }
                    >
                      {participante.autorizacaoRecolhida
                        ? "Recolhida"
                        : "Pendente"}
                    </Badge>
                    {!isFinalizado && !isCancelado && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleAutorizacao}
                        title={
                          participante.autorizacaoRecolhida
                            ? "Marcar como pendente"
                            : "Marcar como recolhida"
                        }
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {isCancelado && participante.dataCancelamento && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Cancelamento</span>
                  <span className="font-medium">
                    {formatDate(participante.dataCancelamento)}
                  </span>
                </div>
              )}
              {isCancelado && participante.valorDevolvido !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Devolvido</span>
                  <span className="font-medium">
                    {formatCurrency(participante.valorDevolvido)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo Financeiro
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor a Pagar</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(participante.valorAPagar)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Pago</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(participante.totalPago)}
                </span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Pendente</span>
                <span
                  className={`font-bold ${
                    participante.pendente > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(participante.pendente)}
                </span>
              </div>
              {participante.valorAPagar > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (participante.totalPago / participante.valorAPagar) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(
                      (participante.totalPago / participante.valorAPagar) *
                      100
                    ).toFixed(1)}
                    % pago
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Histórico de Pagamentos */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Histórico de Pagamentos
          </h2>
          <PagamentosAcampamentoTable
            pagamentos={pagamentos.map((p) => ({
              ...p,
              participante: {
                id: participante.id,
                membro: participante.membro
                  ? { id: participante.membro.id, nome: participante.membro.nome }
                  : undefined,
              },
            }))}
            onDelete={!isFinalizado && !isCancelado ? handleExcluirPagamento : undefined}
            isFinalizado={isFinalizado}
          />
        </div>
      </Card>

      {/* Modals */}
      <PagamentoAcampamentoModal
        isOpen={pagamentoModalOpen}
        onClose={() => setPagamentoModalOpen(false)}
        participanteIdFixo={participanteId}
        participantes={[
          { id: participanteId, nome: participante.membro?.nome || "—" },
        ]}
        onSubmit={handleRegistrarPagamento}
      />

      <CancelarInscricaoModal
        isOpen={cancelarModalOpen}
        onClose={() => setCancelarModalOpen(false)}
        participanteNome={participante.membro?.nome || "—"}
        totalPago={participante.totalPago}
        onConfirm={handleCancelarInscricao}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmarExclusaoPagamento}
        title="Excluir Pagamento"
        message="Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}
