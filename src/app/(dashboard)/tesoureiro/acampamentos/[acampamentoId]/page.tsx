"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ParticipanteAcampamentoModal } from "@/components/forms/participante-acampamento-modal";
import { PagamentoAcampamentoModal } from "@/components/forms/pagamento-acampamento-modal";
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Eye,
  ShoppingCart,
  CheckCircle,
  ArrowLeft,
  Pencil,
  Lock,
} from "lucide-react";
import type {
  Acampamento,
  ResumoAcampamento,
  ParticipanteComPagamentos,
  PagamentoComParticipante,
  ParticipanteFormData,
  PagamentoFormData,
} from "@/types/acampamento";
import { formatDate } from "@/lib/utils/date";
import {
  inscreverParticipanteAction,
  criarPagamentoAction,
  finalizarAcampamentoAction,
} from "./actions";

export default function AcampamentoDashboardPage({
  params,
}: {
  params: Promise<{ acampamentoId: string }>;
}) {
  const { acampamentoId } = use(params);
  const router = useRouter();
  const [acampamento, setAcampamento] = useState<Acampamento | null>(null);
  const [resumo, setResumo] = useState<ResumoAcampamento | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteComPagamentos[]>([]);
  const [ultimosPagamentos, setUltimosPagamentos] = useState<PagamentoComParticipante[]>([]);
  const [membrosDisponiveis, setMembrosDisponiveis] = useState<Array<{ id: string; nome: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [participanteModalOpen, setParticipanteModalOpen] = useState(false);
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [finalizarDialogOpen, setFinalizarDialogOpen] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [acampamentoId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [acampRes, partRes, pagRes, membrosRes] = await Promise.all([
        fetch(`/api/acampamentos/${acampamentoId}`),
        fetch(`/api/acampamentos/${acampamentoId}/participantes`),
        fetch(`/api/acampamentos/${acampamentoId}/pagamentos`),
        fetch(`/api/acampamentos/${acampamentoId}/membros-disponiveis`),
      ]);

      if (acampRes.ok) {
        const acampData = await acampRes.json();
        setAcampamento(acampData.acampamento || null);
        setResumo(acampData.resumo || null);
      }

      if (partRes.ok) {
        const partData = await partRes.json();
        setParticipantes(Array.isArray(partData) ? partData : []);
      }

      if (pagRes.ok) {
        const pagData = await pagRes.json();
        const allPag = Array.isArray(pagData) ? pagData : [];
        setUltimosPagamentos(allPag.slice(0, 5));
      }

      if (membrosRes.ok) {
        const membrosData = await membrosRes.json();
        setMembrosDisponiveis(Array.isArray(membrosData) ? membrosData : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInscreverParticipante = async (data: ParticipanteFormData) => {
    await inscreverParticipanteAction(acampamentoId, data);
    await carregarDados();
  };

  const handleRegistrarPagamento = async (data: PagamentoFormData) => {
    await criarPagamentoAction(acampamentoId, data);
    await carregarDados();
  };

  const handleFinalizar = async () => {
    await finalizarAcampamentoAction(acampamentoId);
    await carregarDados();
    setFinalizarDialogOpen(false);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!acampamento) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Acampamento não encontrado</p>
      </div>
    );
  }

  const isFinalizado = acampamento.status === "finalizado";
  const participantesComPendencia = participantes.filter(
    (p) => p.status === "inscrito" && p.pendente > 0
  );
  const autorizacoesPendentes = participantes.filter(
    (p) => p.status === "inscrito" && !p.autorizacaoRecolhida && p.membro?.tipo === "desbravador"
  );

  // Build list for payment modal
  const participantesParaPagamento = participantes
    .filter((p) => p.status === "inscrito")
    .map((p) => ({ id: p.id, nome: p.membro?.nome || "—" }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/tesoureiro/acampamentos")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {acampamento.nome}
              </h1>
              <Badge
                variant={isFinalizado ? "secondary" : "success"}
              >
                {isFinalizado ? "Finalizado" : "Aberto"}
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {formatDate(acampamento.dataInicio)} - {formatDate(acampamento.dataFim)}
              {acampamento.descricao && ` · ${acampamento.descricao}`}
            </p>
          </div>
        </div>
        {!isFinalizado && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/tesoureiro/acampamentos/${acampamentoId}/editar`)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => setFinalizarDialogOpen(true)}
            >
              <Lock className="w-4 h-4 mr-1" />
              Finalizar
            </Button>
          </div>
        )}
      </div>

      {/* Cards L1: Participantes */}
      {resumo && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Participantes</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                      {resumo.totalParticipantes}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm text-gray-600">Isentos</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {resumo.totalIsentos}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Autorizações Pendentes
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">
                      {resumo.autorizacoesPendentes}
                    </p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-amber-500 opacity-20" />
                </div>
              </div>
            </Card>
          </div>

          {/* Cards L2: Financeiro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="p-6">
                <p className="text-sm text-gray-600">Valor Esperado</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(resumo.valorEsperado)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Arrecadado</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatCurrency(resumo.totalArrecadado)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, resumo.percentualArrecadado)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {resumo.percentualArrecadado.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm text-gray-600">Pendente</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(resumo.totalPendente)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm text-gray-600">Valor/Pessoa</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(acampamento.valorPorPessoa)}
                </p>
              </div>
            </Card>
          </div>

          {/* Cards L3: Gastos e Saldo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Gastos</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {formatCurrency(resumo.totalGastos)}
                    </p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-red-500 opacity-20" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm text-gray-600">Saldo</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    resumo.saldo >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(resumo.saldo)}
                </p>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Ações Rápidas */}
      {!isFinalizado && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ações Rápidas
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setParticipanteModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Participante
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setPagamentoModalOpen(true)}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Registrar Pagamento
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  router.push(`/tesoureiro/acampamentos/${acampamentoId}/gastos`)
                }
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Registrar Gasto
              </Button>
              <Link href={`/tesoureiro/acampamentos/${acampamentoId}/participantes`}>
                <Button variant="secondary" size="sm">
                  <Users className="w-4 h-4 mr-1" />
                  Ver Participantes
                </Button>
              </Link>
              <Link href={`/tesoureiro/acampamentos/${acampamentoId}/pagamentos`}>
                <Button variant="secondary" size="sm">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Ver Pagamentos
                </Button>
              </Link>
              <Link href={`/tesoureiro/acampamentos/${acampamentoId}/gastos`}>
                <Button variant="secondary" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Gastos
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Participantes com Pendência */}
      {participantesComPendencia.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Participantes com Pendência
            </h2>
            <div className="space-y-3">
              {participantesComPendencia.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {p.membro?.nome || "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Pago: {formatCurrency(p.totalPago)} de{" "}
                      {formatCurrency(p.valorAPagar)}
                    </p>
                  </div>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(p.pendente)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Autorizações Pendentes */}
      {autorizacoesPendentes.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Autorizações Pendentes
            </h2>
            <div className="space-y-3">
              {autorizacoesPendentes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {p.membro?.nome || "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.membro?.unidade?.nome || "Sem unidade"}
                    </p>
                  </div>
                  <Badge variant="warning">Pendente</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Últimos Pagamentos */}
      {ultimosPagamentos.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Últimos Pagamentos
              </h2>
              <Link href={`/tesoureiro/acampamentos/${acampamentoId}/pagamentos`}>
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {ultimosPagamentos.map((pag) => (
                <div
                  key={pag.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {pag.participante?.membro?.nome || "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(pag.data)}
                    </p>
                  </div>
                  <span className="text-green-600 font-semibold">
                    {formatCurrency(pag.valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <ParticipanteAcampamentoModal
        isOpen={participanteModalOpen}
        onClose={() => setParticipanteModalOpen(false)}
        membrosDisponiveis={membrosDisponiveis}
        valorPadrao={acampamento.valorPorPessoa}
        onSubmit={handleInscreverParticipante}
      />

      <PagamentoAcampamentoModal
        isOpen={pagamentoModalOpen}
        onClose={() => setPagamentoModalOpen(false)}
        participantes={participantesParaPagamento}
        onSubmit={handleRegistrarPagamento}
      />

      {/* Finalizar Dialog */}
      <ConfirmDialog
        isOpen={finalizarDialogOpen}
        onClose={() => setFinalizarDialogOpen(false)}
        onConfirm={handleFinalizar}
        title="Finalizar Acampamento"
        message={`Tem certeza que deseja finalizar "${acampamento.nome}"? Após a finalização, não será possível editar, adicionar participantes ou registrar pagamentos.`}
        confirmText="Finalizar"
        variant="danger"
      />
    </div>
  );
}
