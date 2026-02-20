"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CheckCheck, XCircle, Save } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import type { PresencaComMembro, PresencaFormItem, StatusPresenca } from "@/types/encontro";

interface ChamadaFormProps {
  encontroId: string;
  membrosComPresenca: PresencaComMembro[];
  editavel: boolean;
  /** When "conselheiro", status is readonly (admin fills it); material/uniforme are editable */
  role?: "admin" | "conselheiro";
  onSave: (presencas: PresencaFormItem[]) => Promise<{ success: boolean; error?: string }>;
}

const statusOptions = [
  { value: "pontual", label: "Pontual" },
  { value: "atrasado", label: "Atrasado" },
  { value: "falta", label: "Falta" },
  { value: "falta_justificada", label: "Falta Justificada" },
];

export function ChamadaForm({
  encontroId,
  membrosComPresenca,
  editavel,
  role = "admin",
  onSave,
}: ChamadaFormProps) {
  const isConselheiro = role === "conselheiro";
  // Conselheiro can edit material/uniforme even when status is readonly
  const canEditExtras = editavel || (isConselheiro && editavel);
  const canEditStatus = editavel && !isConselheiro;
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

  const updatePresenca = (index: number, field: keyof PresencaFormItem, value: unknown) => {
    setPresencas((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const marcarTodos = (status: StatusPresenca) => {
    setPresencas((prev) =>
      prev.map((p) => ({ ...p, status }))
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await onSave(presencas);
      if (result.success) {
        success("Chamada salva com sucesso");
      } else {
        error(result.error || "Erro ao salvar chamada");
      }
    } catch (err) {
      error("Erro ao salvar chamada");
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
      {/* Ações em batch - only for admin */}
      {canEditStatus && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={() => marcarTodos("pontual")}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Todos Pontual
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => marcarTodos("falta")}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Todos Falta
          </Button>
        </div>
      )}

      {/* Lista de membros */}
      <div className="space-y-3">
        {membrosComPresenca.map((membro, index) => (
          <div
            key={membro.membroId}
            className="border rounded-lg p-3 sm:p-4 space-y-3"
          >
            {/* Header do membro */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {membro.membro.nome}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {membro.membro.classe && (
                    <span className="text-xs text-gray-500">
                      {membro.membro.classe.nome}
                    </span>
                  )}
                  {membro.membro.tipo === "diretoria" && (
                    <Badge variant="outline" className="text-xs">
                      Diretoria
                    </Badge>
                  )}
                </div>
              </div>
              <StatusBadge status={presencas[index].status} />
            </div>

            {/* Campos */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Presença */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Presença</label>
                <Select
                  value={presencas[index].status}
                  onChange={(e) =>
                    updatePresenca(index, "status", e.target.value)
                  }
                  options={statusOptions}
                  disabled={!canEditStatus}
                />
              </div>

              {/* Material */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Material</label>
                <label className="flex items-center gap-2 h-10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={presencas[index].temMaterial}
                    onChange={(e) =>
                      updatePresenca(index, "temMaterial", e.target.checked)
                    }
                    disabled={!editavel}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Sim</span>
                </label>
              </div>

              {/* Uniforme */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Uniforme</label>
                <label className="flex items-center gap-2 h-10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={presencas[index].temUniforme}
                    onChange={(e) =>
                      updatePresenca(index, "temUniforme", e.target.checked)
                    }
                    disabled={!editavel}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Sim</span>
                </label>
              </div>

              {/* Observação */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Observação</label>
                <input
                  type="text"
                  value={presencas[index].observacao || ""}
                  onChange={(e) =>
                    updatePresenca(index, "observacao", e.target.value)
                  }
                  disabled={!editavel}
                  placeholder="Opcional"
                  className="input text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão Salvar */}
      {editavel && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loading size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {loading ? "Salvando..." : "Salvar Chamada"}
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: StatusPresenca }) {
  const config: Record<StatusPresenca, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
    pontual: { label: "Pontual", variant: "success" },
    atrasado: { label: "Atrasado", variant: "warning" },
    falta: { label: "Falta", variant: "error" },
    falta_justificada: { label: "Justificada", variant: "default" },
  };

  const c = config[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
