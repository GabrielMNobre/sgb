"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GastosTable } from "@/components/tables/gastos-table";
import { GastoModal } from "@/components/forms/gasto-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArrowLeft, Plus } from "lucide-react";
import type { Evento } from "@/types/evento";
import type { GastoComEvento, GastoFormData } from "@/types/gasto";
import {
  criarGastoAction,
  atualizarGastoAction,
  excluirGastoAction,
} from "../../actions";

export default function EventoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.eventoId as string;

  const [evento, setEvento] = useState<Evento | null>(null);
  const [gastos, setGastos] = useState<GastoComEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoSelecionado, setGastoSelecionado] = useState<GastoComEvento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gastoParaExcluir, setGastoParaExcluir] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [eventoId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [eventoRes, gastosRes] = await Promise.all([
        fetch(`/api/eventos/${eventoId}`),
        fetch(`/api/gastos?eventoId=${eventoId}`),
      ]);

      if (eventoRes.ok && gastosRes.ok) {
        const eventoData = await eventoRes.json();
        const gastosData = await gastosRes.json();
        setEvento(eventoData || null);
        setGastos(Array.isArray(gastosData) ? gastosData : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setEvento(null);
      setGastos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoGasto = () => {
    setGastoSelecionado(null);
    setModalOpen(true);
  };

  const handleEditarGasto = (gasto: GastoComEvento) => {
    setGastoSelecionado(gasto);
    setModalOpen(true);
  };

  const handleSalvarGasto = async (data: GastoFormData, id?: string) => {
    if (id) {
      await atualizarGastoAction(id, data);
    } else {
      await criarGastoAction(data);
    }
    await carregarDados();
  };

  const handleExcluirGasto = (id: string) => {
    setGastoParaExcluir(id);
    setDeleteDialogOpen(true);
  };

  const confirmarExclusao = async () => {
    if (gastoParaExcluir) {
      await excluirGastoAction(gastoParaExcluir, eventoId);
      await carregarDados();
    }
    setDeleteDialogOpen(false);
    setGastoParaExcluir(null);
  };

  const totalGasto = gastos.reduce((sum, g) => sum + g.valor, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Evento não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/financeiro/gastos/eventos")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Eventos
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{evento.nome}</h1>
              <Badge variant={evento.ativo ? "success" : "secondary"}>
                {evento.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {evento.descricao && (
              <p className="text-gray-600 mt-2">{evento.descricao}</p>
            )}
            {evento.data && (
              <p className="text-sm text-gray-500 mt-1">
                Data: {formatDate(evento.data)}
              </p>
            )}
          </div>
          <Button variant="primary" onClick={handleNovoGasto}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Gasto
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total Gasto</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {formatCurrency(totalGasto)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Quantidade de Gastos</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {gastos.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Lista de Gastos */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Gastos do Evento
          </h2>
          <GastosTable
            gastos={gastos}
            onEdit={handleEditarGasto}
            onDelete={handleExcluirGasto}
          />
        </div>
      </Card>

      {/* Modal Gasto */}
      <GastoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventos={[evento]}
        eventoIdPadrao={eventoId}
        gastoInicial={
          gastoSelecionado
            ? {
                id: gastoSelecionado.id,
                eventoId: gastoSelecionado.eventoId,
                data: new Date(gastoSelecionado.data).toISOString().split("T")[0],
                descricao: gastoSelecionado.descricao,
                valor: gastoSelecionado.valor,
                observacao: gastoSelecionado.observacao,
              }
            : undefined
        }
        onSubmit={handleSalvarGasto}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmarExclusao}
        title="Excluir Gasto"
        message="Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}
