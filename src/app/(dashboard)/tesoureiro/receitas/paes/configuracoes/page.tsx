"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ConfiguracoesPaesForm } from "@/components/forms/configuracoes-paes-form";
import type { ConfiguracoesPaes, ConfiguracoesPaesFormData } from "@/types/paes";
import { atualizarConfiguracoesPaesAction } from "../actions";

export default function ConfiguracoesPaesPage() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesPaes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/paes/configuracoes");
      if (res.ok) {
        const data = await res.json();
        setConfiguracoes(data);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (data: ConfiguracoesPaesFormData) => {
    await atualizarConfiguracoesPaesAction(data);
    await carregarDados();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações de Pães</h1>
        <p className="text-gray-600 mt-1">
          Configure os valores padrão para o módulo de pães
        </p>
      </div>

      <Card>
        <div className="p-6">
          {configuracoes && (
            <ConfiguracoesPaesForm
              configuracoes={configuracoes}
              onSubmit={handleSalvar}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
