"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SemanasPaesTable } from "@/components/tables/semanas-paes-table";
import { SemanaPaesModal } from "@/components/forms/semana-paes-modal";
import { Plus } from "lucide-react";
import type { SemanaPaesComResumo, SemanaPaesFormData } from "@/types/paes";
import { criarSemanaPaesAction } from "../actions";

export default function SemanasPaesPage() {
  const [semanas, setSemanas] = useState<SemanaPaesComResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/paes/semanas");

      if (response.ok) {
        const data = await response.json();
        setSemanas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setSemanas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNovaSemana = () => {
    setModalOpen(true);
  };

  const handleSalvarSemana = async (data: SemanaPaesFormData) => {
    await criarSemanaPaesAction(data);
    await carregarDados();
  };

  const totalSemanas = semanas.length;
  const semanasAbertas = semanas.filter((s) => s.status === "aberta").length;
  const semanasFinalizadas = semanas.filter(
    (s) => s.status === "finalizada"
  ).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Semanas de Produção
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerenciamento das semanas de produção de pães
          </p>
        </div>
        <Button variant="primary" onClick={handleNovaSemana} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Semana
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total Semanas</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {totalSemanas}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Abertas</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
              {semanasAbertas}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Finalizadas</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {semanasFinalizadas}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <SemanasPaesTable
              semanas={semanas}
              basePath="/admin/financeiro/receitas/paes/semanas"
            />
          )}
        </div>
      </Card>

      {/* Modal Nova Semana */}
      <SemanaPaesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSalvarSemana}
      />
    </div>
  );
}
