"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParticipantesAcampamentoTable } from "@/components/tables/participantes-acampamento-table";
import { ParticipantesAcampamentoFilters } from "@/components/forms/participantes-acampamento-filters";
import { ParticipanteAcampamentoModal } from "@/components/forms/participante-acampamento-modal";
import { Loading } from "@/components/ui/loading";
import { Plus, ArrowLeft } from "lucide-react";
import type {
  Acampamento,
  ParticipanteComPagamentos,
  FiltrosParticipante,
  ParticipanteFormData,
} from "@/types/acampamento";
import { inscreverParticipanteAction } from "../actions";

export default function ParticipantesPage({
  params,
}: {
  params: Promise<{ acampamentoId: string }>;
}) {
  const { acampamentoId } = use(params);
  const router = useRouter();
  const [acampamento, setAcampamento] = useState<Acampamento | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteComPagamentos[]>([]);
  const [filtros, setFiltros] = useState<FiltrosParticipante>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [membrosDisponiveis, setMembrosDisponiveis] = useState<Array<{ id: string; nome: string }>>([]);

  useEffect(() => {
    carregarDados();
  }, [acampamentoId, filtros]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filtros.status) queryParams.set("status", filtros.status);
      if (filtros.situacaoPagamento) queryParams.set("situacaoPagamento", filtros.situacaoPagamento);
      if (filtros.autorizacao) queryParams.set("autorizacao", filtros.autorizacao);
      if (filtros.busca) queryParams.set("busca", filtros.busca);

      const [acampRes, partRes, membrosRes] = await Promise.all([
        fetch(`/api/acampamentos/${acampamentoId}`),
        fetch(`/api/acampamentos/${acampamentoId}/participantes?${queryParams}`),
        fetch(`/api/acampamentos/${acampamentoId}/membros-disponiveis`),
      ]);

      if (acampRes.ok) {
        const acampData = await acampRes.json();
        setAcampamento(acampData.acampamento || null);
      }
      if (partRes.ok) {
        const data = await partRes.json();
        setParticipantes(Array.isArray(data) ? data : []);
      }
      if (membrosRes.ok) {
        const data = await membrosRes.json();
        setMembrosDisponiveis(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInscrever = async (data: ParticipanteFormData) => {
    await inscreverParticipanteAction(acampamentoId, data);
    await carregarDados();
  };

  const handleVerParticipante = (participanteId: string) => {
    router.push(`/admin/financeiro/acampamentos/${acampamentoId}/participantes/${participanteId}`);
  };

  const isFinalizado = acampamento?.status === "finalizado";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/financeiro/acampamentos/${acampamentoId}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Participantes</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{acampamento?.nome}</p>
          </div>
        </div>
        {!isFinalizado && (
          <Button variant="primary" onClick={() => setModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Participante
          </Button>
        )}
      </div>

      <Card>
        <div className="p-6">
          <ParticipantesAcampamentoFilters filtros={filtros} onFiltrosChange={setFiltros} />
        </div>
      </Card>

      <Card>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12"><Loading size="lg" /><p className="text-gray-500 mt-3">Carregando...</p></div>
          ) : (
            <ParticipantesAcampamentoTable
              participantes={participantes}
              onView={handleVerParticipante}
              isFinalizado={isFinalizado}
            />
          )}
        </div>
      </Card>

      {acampamento && (
        <ParticipanteAcampamentoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          membrosDisponiveis={membrosDisponiveis}
          valorPadrao={acampamento.valorPorPessoa}
          onSubmit={handleInscrever}
        />
      )}
    </div>
  );
}
