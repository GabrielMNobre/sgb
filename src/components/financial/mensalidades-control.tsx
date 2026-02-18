"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MensalidadesTable } from "@/components/tables/mensalidades-table";
import { Plus } from "lucide-react";
import type { MensalidadeComRelacoes, RegistrarPagamentoFormData } from "@/types/mensalidade";
import type { Unidade } from "@/types/unidade";

interface MensalidadesControlProps {
  initialMensalidades: MensalidadeComRelacoes[];
  unidades: Unidade[];
  basePath: string;
  initialMes: number;
  initialAno: number;
  onGerar: (mes: number, ano: number) => Promise<{ criadas: number; ignoradas: number }>;
  onRegistrarPagamento: (data: RegistrarPagamentoFormData) => Promise<void>;
  onEstornarPagamento: (id: string) => Promise<void>;
}

export function MensalidadesControl({
  initialMensalidades,
  unidades,
  basePath,
  initialMes,
  initialAno,
  onGerar,
  onRegistrarPagamento,
  onEstornarPagamento,
}: MensalidadesControlProps) {
  const hoje = new Date();
  const [mes, setMes] = useState(initialMes);
  const [ano, setAno] = useState(initialAno);
  const [gerando, setGerando] = useState(false);

  const handleGerar = async () => {
    setGerando(true);
    try {
      const resultado = await onGerar(mes, ano);
      alert(`Mensalidades geradas:\n${resultado.criadas} criadas\n${resultado.ignoradas} já existentes`);
      // Reload the page to get fresh data
      window.location.reload();
    } catch (error) {
      console.error("Erro ao gerar mensalidades:", error);
      alert("Erro ao gerar mensalidades");
    } finally {
      setGerando(false);
    }
  };

  const handleMesChange = (newMes: number) => {
    setMes(newMes);
    // Navigate to update URL params
    const url = new URL(window.location.href);
    url.searchParams.set('mes', newMes.toString());
    url.searchParams.set('ano', ano.toString());
    window.location.href = url.toString();
  };

  const handleAnoChange = (newAno: number) => {
    setAno(newAno);
    // Navigate to update URL params
    const url = new URL(window.location.href);
    url.searchParams.set('mes', mes.toString());
    url.searchParams.set('ano', newAno.toString());
    window.location.href = url.toString();
  };

  const anos = Array.from({ length: 5 }, (_, i) => hoje.getFullYear() - 2 + i);
  const meses = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];
  const anosOptions = anos.map(a => ({ value: a.toString(), label: a.toString() }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Month/Year Selector */}
      <Card>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês
              </label>
              <Select
                value={mes.toString()}
                onChange={(e) => handleMesChange(parseInt(e.target.value))}
                options={meses}
                className="w-full"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <Select
                value={ano.toString()}
                onChange={(e) => handleAnoChange(parseInt(e.target.value))}
                options={anosOptions}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleGerar}
              disabled={gerando}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              {gerando ? "Gerando..." : "Gerar Mensalidades"}
            </Button>
          </div>

          {initialMensalidades.length === 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Dica:</strong> Clique em "Gerar Mensalidades" para criar automaticamente
                as mensalidades de todos os membros ativos (exceto isentos) para o mês selecionado.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <MensalidadesTable
          mensalidades={initialMensalidades}
          unidades={unidades}
          basePath={basePath}
          onRegistrarPagamento={onRegistrarPagamento}
          onEstornarPagamento={onEstornarPagamento}
        />
      </Card>
    </div>
  );
}
