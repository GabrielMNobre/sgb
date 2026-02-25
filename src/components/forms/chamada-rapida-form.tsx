"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CheckCheck, XCircle, Save } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import type { PresencaComMembro, PresencaFormItem, StatusPresenca } from "@/types/encontro";

interface ChamadaRapidaFormProps {
  encontroId: string;
  membrosComPresenca: PresencaComMembro[];
  editavel: boolean;
  onSave: (presencas: PresencaFormItem[]) => Promise<{ success: boolean; error?: string }>;
}

const statusConfig: Record<StatusPresenca, { label: string; short: string; variant: "success" | "warning" | "error" | "default"; bg: string; activeBg: string }> = {
  pontual: { label: "Pontual", short: "P", variant: "success", bg: "border-green-200 text-green-700 hover:bg-green-50", activeBg: "bg-green-600 text-white border-green-600" },
  atrasado: { label: "Atrasado", short: "A", variant: "warning", bg: "border-yellow-200 text-yellow-700 hover:bg-yellow-50", activeBg: "bg-yellow-500 text-white border-yellow-500" },
  falta: { label: "Falta", short: "F", variant: "error", bg: "border-red-200 text-red-700 hover:bg-red-50", activeBg: "bg-red-600 text-white border-red-600" },
  falta_justificada: { label: "Justificada", short: "J", variant: "default", bg: "border-gray-200 text-gray-700 hover:bg-gray-50", activeBg: "bg-gray-600 text-white border-gray-600" },
};

export function ChamadaRapidaForm({
  encontroId,
  membrosComPresenca,
  editavel,
  onSave,
}: ChamadaRapidaFormProps) {
  const [presencas, setPresencas] = useState<PresencaFormItem[]>(
    membrosComPresenca.map((m) => ({
      membroId: m.membroId,
      status: m.status,
      temMaterial: m.temMaterial,
      temUniforme: m.temUniforme,
      observacao: m.observacao || "",
    }))
  );
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const updateStatus = (index: number, status: StatusPresenca) => {
    setPresencas((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status };
      return updated;
    });
  };

  const marcarTodos = (status: StatusPresenca) => {
    setPresencas((prev) => prev.map((p) => ({ ...p, status })));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await onSave(presencas);
      if (result.success) {
        success("Presenças salvas com sucesso");
      } else {
        error(result.error || "Erro ao salvar presenças");
      }
    } catch {
      error("Erro ao salvar presenças");
    } finally {
      setLoading(false);
    }
  };

  if (membrosComPresenca.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum membro ativo nesta unidade</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ações em batch */}
      {editavel && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          <Button variant="outline" size="sm" onClick={() => marcarTodos("pontual")}>
            <CheckCheck className="h-4 w-4 mr-1" />
            Todos Pontual
          </Button>
          <Button variant="outline" size="sm" onClick={() => marcarTodos("falta")}>
            <XCircle className="h-4 w-4 mr-1" />
            Todos Falta
          </Button>
        </div>
      )}

      {/* Lista de membros */}
      <div className="space-y-2">
        {membrosComPresenca.map((membro, index) => {
          const current = presencas[index].status;
          return (
            <div
              key={membro.membroId}
              className="border rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {membro.membro.nome}
                  </p>
                  {membro.membro.classe && (
                    <span className="text-xs text-gray-500">
                      {membro.membro.classe.nome}
                    </span>
                  )}
                </div>
                {membro.membro.tipo === "diretoria" && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    Diretoria
                  </Badge>
                )}
              </div>

              {/* Status buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.entries(statusConfig) as [StatusPresenca, typeof statusConfig[StatusPresenca]][]).map(
                  ([status, cfg]) => (
                    <button
                      key={status}
                      type="button"
                      disabled={!editavel}
                      onClick={() => updateStatus(index, status)}
                      className={`min-h-[44px] rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                        current === status ? cfg.activeBg : cfg.bg
                      } ${!editavel ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className="sm:hidden">{cfg.short}</span>
                      <span className="hidden sm:inline">{cfg.label}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão Salvar */}
      {editavel && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loading size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {loading ? "Salvando..." : "Salvar Presenças"}
          </Button>
        </div>
      )}
    </div>
  );
}
