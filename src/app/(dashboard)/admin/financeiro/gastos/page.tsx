"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GastosTable } from "@/components/tables/gastos-table";
import { GastosFilters } from "@/components/forms/gastos-filters";
import { GastoModal } from "@/components/forms/gasto-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus } from "lucide-react";
import type { GastoComEvento, FiltrosGasto, GastoFormData } from "@/types/gasto";
import type { Evento } from "@/types/evento";
import {
  criarGastoAction,
  atualizarGastoAction,
  excluirGastoAction,
} from "./actions";

export default function GastosPage() {
  const [gastos, setGastos] = useState<GastoComEvento[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtros, setFiltros] = useState<FiltrosGasto>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoSelecionado, setGastoSelecionado] = useState<GastoComEvento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gastoParaExcluir, setGastoParaExcluir] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [gastosRes, eventosRes] = await Promise.all([
        fetch(`/api/gastos?${new URLSearchParams(filtros as any)}`),
        fetch("/api/eventos"),
      ]);

      if (gastosRes.ok && eventosRes.ok) {
        const gastosData = await gastosRes.json();
        const eventosData = await eventosRes.json();
        setGastos(Array.isArray(gastosData) ? gastosData : []);
        setEventos(Array.isArray(eventosData) ? eventosData : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setGastos([]);
      setEventos([]);
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
      const gasto = gastos.find((g) => g.id === gastoParaExcluir);
      if (gasto) {
        await excluirGastoAction(gastoParaExcluir, gasto.eventoId);
        await carregarDados();
      }
    }
    setDeleteDialogOpen(false);
    setGastoParaExcluir(null);
  };

  const totalGastos = gastos.reduce((sum, g) => sum + g.valor, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gastos</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Controle de gastos e despesas do clube
          </p>
        </div>
        <Button variant="primary" onClick={handleNovoGasto} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Gasto
        </Button>
      </div>

      {/* Resumo */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Gastos no Período</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalGastos)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Quantidade</p>
              <p className="text-2xl font-semibold text-gray-700 mt-1">
                {gastos.length}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <Card>
        <div className="p-6">
          <GastosFilters
            eventos={eventos}
            filtros={filtros}
            onFiltrosChange={setFiltros}
          />
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <GastosTable
              gastos={gastos}
              onEdit={handleEditarGasto}
              onDelete={handleExcluirGasto}
            />
          )}
        </div>
      </Card>

      {/* Modal Gasto */}
      <GastoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventos={eventos}
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
