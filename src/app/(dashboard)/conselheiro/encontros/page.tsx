"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EncontrosFilters } from "@/components/forms/encontros-filters";
import { EncontrosTable } from "@/components/tables/encontros-table";
import type { Encontro, FiltrosEncontro } from "@/types/encontro";

export default function ConselheiroEncontrosPage() {
  const [encontros, setEncontros] = useState<Encontro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosEncontro>({});

  const carregarEncontros = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.status) params.set("status", filtros.status);
      if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.set("dataFim", filtros.dataFim);

      const res = await fetch(`/api/encontros?${params.toString()}`);
      if (res.ok) {
        setEncontros(await res.json());
      }
    } catch (err) {
      console.error("Erro ao carregar encontros:", err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarEncontros();
  }, [carregarEncontros]);

  const emAndamento = encontros.filter((e) => e.status === "em_andamento");

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Encontros</h1>
        <p className="text-sm sm:text-base text-gray-500">Visualize os encontros do clube</p>
      </div>

      {emAndamento.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-green-800">
              Encontro em andamento! Faça a chamada da sua unidade.
            </p>
            <Link
              href={`/conselheiro/chamada/${emAndamento[0].id}`}
              className="text-sm font-medium text-green-700 hover:text-green-900 underline"
            >
              Fazer Chamada
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <p className="text-xs sm:text-sm text-gray-500">Total</p>
            <p className="text-xl sm:text-2xl font-bold">{encontros.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <p className="text-xs sm:text-sm text-gray-500">Agendados</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {encontros.filter((e) => e.status === "agendado").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <p className="text-xs sm:text-sm text-gray-500">Em Andamento</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">{emAndamento.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <p className="text-xs sm:text-sm text-gray-500">Finalizados</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {encontros.filter((e) => e.status === "finalizado").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <EncontrosFilters filtros={filtros} onFiltrosChange={setFiltros} />

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center py-12">
              <Loading size="lg" />
              <p className="text-gray-500 mt-3">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      ) : encontros.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhum encontro encontrado</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EncontrosTable
          encontros={encontros}
          readOnly
          onView={(id) => {
            window.location.href = `/conselheiro/chamada/${id}`;
          }}
        />
      )}
    </div>
  );
}
