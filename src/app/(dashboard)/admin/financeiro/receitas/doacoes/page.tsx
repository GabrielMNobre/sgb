"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DoacoesTable } from "@/components/tables/doacoes-table";
import { DoacoesFilters } from "@/components/forms/doacoes-filters";
import { DoacaoModal } from "@/components/forms/doacao-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Heart, TrendingUp } from "lucide-react";
import type { Doacao, FiltrosDoacao, DoacaoFormData } from "@/types/doacao";
import {
  criarDoacaoAction,
  atualizarDoacaoAction,
  excluirDoacaoAction,
} from "./actions";

export default function AdminDoacoesPage() {
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [filtros, setFiltros] = useState<FiltrosDoacao>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [doacaoSelecionada, setDoacaoSelecionada] = useState<Doacao | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doacaoParaExcluir, setDoacaoParaExcluir] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/doacoes?${new URLSearchParams(filtros as any)}`);

      if (response.ok) {
        const data = await response.json();
        setDoacoes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setDoacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNovaDoacao = () => {
    setDoacaoSelecionada(null);
    setModalOpen(true);
  };

  const handleEditarDoacao = (doacao: Doacao) => {
    setDoacaoSelecionada(doacao);
    setModalOpen(true);
  };

  const handleSalvarDoacao = async (data: DoacaoFormData, id?: string) => {
    if (id) {
      await atualizarDoacaoAction(id, data);
    } else {
      await criarDoacaoAction(data);
    }
    await carregarDados();
  };

  const handleExcluirDoacao = (id: string) => {
    setDoacaoParaExcluir(id);
    setDeleteDialogOpen(true);
  };

  const confirmarExclusao = async () => {
    if (doacaoParaExcluir) {
      await excluirDoacaoAction(doacaoParaExcluir);
      await carregarDados();
    }
    setDeleteDialogOpen(false);
    setDoacaoParaExcluir(null);
  };

  const totalDoacoes = doacoes.reduce((sum, d) => sum + d.valor, 0);

  // Top 5 doadores do período filtrado
  const topDoadores = doacoes
    .filter((d) => d.doador)
    .reduce((acc, doacao) => {
      const nome = doacao.doador!;
      acc[nome] = (acc[nome] || 0) + doacao.valor;
      return acc;
    }, {} as Record<string, number>);

  const topDoadoresArray = Object.entries(topDoadores)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Doações</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Controle de doações recebidas pelo clube
          </p>
        </div>
        <Button variant="primary" onClick={handleNovaDoacao} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Doação
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Doações</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
                  {formatCurrency(totalDoacoes)}
                </p>
              </div>
              <Heart className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Número de Doações</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {doacoes.length}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {doacoes.length > 0 ? formatCurrency(totalDoacoes / doacoes.length) : "R$ 0,00"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-6">
          <DoacoesFilters
            filtros={filtros}
            onFiltrosChange={setFiltros}
          />
        </div>
      </Card>

      {/* Top Doadores */}
      {topDoadoresArray.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top Doadores no Período
            </h2>
            <div className="space-y-3">
              {topDoadoresArray.map((doador, index) => (
                <div
                  key={doador.nome}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{doador.nome}</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(doador.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Tabela */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <DoacoesTable
              doacoes={doacoes}
              onEdit={handleEditarDoacao}
              onDelete={handleExcluirDoacao}
            />
          )}
        </div>
      </Card>

      {/* Modal Doação */}
      <DoacaoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        doacaoInicial={
          doacaoSelecionada
            ? {
                id: doacaoSelecionada.id,
                data: new Date(doacaoSelecionada.data).toISOString().split("T")[0],
                valor: doacaoSelecionada.valor,
                doador: doacaoSelecionada.doador,
                observacao: doacaoSelecionada.observacao,
              }
            : undefined
        }
        onSubmit={handleSalvarDoacao}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmarExclusao}
        title="Excluir Doação"
        message="Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}
