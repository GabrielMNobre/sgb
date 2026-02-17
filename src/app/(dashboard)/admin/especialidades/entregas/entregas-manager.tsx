"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EspecialidadePendente } from "@/types/especialidade";
import type { Unidade } from "@/types/unidade";
import { marcarEntregaAction, marcarEntregasEmLoteAction } from "../actions";
import { formatDate } from "@/lib/utils/date";

interface EntregasManagerProps {
  entregas: EspecialidadePendente[];
  unidades: Unidade[];
}

export function EntregasManager({ entregas, unidades }: EntregasManagerProps) {
  const [unidadeFiltro, setUnidadeFiltro] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    entrega: EspecialidadePendente | null;
    dataEntrega: string;
  }>({ isOpen: false, entrega: null, dataEntrega: new Date().toISOString().split("T")[0] });
  const [loteDialog, setLoteDialog] = useState<{
    isOpen: boolean;
    dataEntrega: string;
  }>({ isOpen: false, dataEntrega: new Date().toISOString().split("T")[0] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const unidadeOptions = [
    { value: "", label: "Todas as unidades" },
    ...unidades.map((u) => ({ value: u.id, label: u.nome })),
  ];

  const entregasFiltradas = unidadeFiltro
    ? entregas.filter((e) => e.unidadeId === unidadeFiltro)
    : entregas;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === entregasFiltradas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entregasFiltradas.map((e) => e.id));
    }
  };

  const handleMarcarEntrega = async () => {
    if (!confirmDialog.entrega) return;
    setLoading(true);
    try {
      await marcarEntregaAction(confirmDialog.entrega.id, confirmDialog.dataEntrega);
      success("Entrega registrada com sucesso");
      router.refresh();
    } catch (err) {
      error("Erro ao registrar entrega");
    } finally {
      setLoading(false);
      setConfirmDialog({ isOpen: false, entrega: null, dataEntrega: new Date().toISOString().split("T")[0] });
    }
  };

  const handleMarcarEntregasEmLote = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await marcarEntregasEmLoteAction(selectedIds, loteDialog.dataEntrega);
      success(`${selectedIds.length} entrega(s) registrada(s) com sucesso`);
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      error("Erro ao registrar entregas");
    } finally {
      setLoading(false);
      setLoteDialog({ isOpen: false, dataEntrega: new Date().toISOString().split("T")[0] });
    }
  };

  if (entregas.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhuma entrega pendente"
        description="Todas as especialidades foram entregues"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Select
          value={unidadeFiltro}
          onChange={(e) => setUnidadeFiltro(e.target.value)}
          options={unidadeOptions}
          className="sm:w-64"
        />
        {selectedIds.length > 0 && (
          <Button onClick={() => setLoteDialog({ isOpen: true, dataEntrega: new Date().toISOString().split("T")[0] })}>
            <Package className="h-4 w-4 mr-2" />
            Marcar {selectedIds.length} como entregue(s)
          </Button>
        )}
      </div>

      {entregasFiltradas.length === 0 ? (
        <EmptyState
          title="Nenhuma entrega pendente nesta unidade"
          description="Selecione outra unidade ou aguarde novas conquistas"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <button
                  onClick={toggleSelectAll}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {selectedIds.length === entregasFiltradas.length ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </TableHead>
              <TableHead>Membro</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Conclusão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entregasFiltradas.map((entrega) => (
              <TableRow key={entrega.id}>
                <TableCell>
                  <button
                    onClick={() => toggleSelection(entrega.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {selectedIds.includes(entrega.id) ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </TableCell>
                <TableCell className="font-medium">{entrega.membroNome}</TableCell>
                <TableCell>{entrega.unidadeNome || "-"}</TableCell>
                <TableCell>{entrega.especialidadeNome}</TableCell>
                <TableCell>{formatDate(entrega.dataConclusao)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setConfirmDialog({
                        isOpen: true,
                        entrega,
                        dataEntrega: new Date().toISOString().split("T")[0],
                      })
                    }
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Entregar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialog de entrega individual */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, entrega: null, dataEntrega: new Date().toISOString().split("T")[0] })}
        onConfirm={handleMarcarEntrega}
        title="Registrar Entrega"
        message={
          <div className="space-y-4">
            <p>
              Deseja registrar a entrega da especialidade <strong>{confirmDialog.entrega?.especialidadeNome}</strong> para <strong>{confirmDialog.entrega?.membroNome}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Entrega
              </label>
              <input
                type="date"
                value={confirmDialog.dataEntrega}
                onChange={(e) => setConfirmDialog((prev) => ({ ...prev, dataEntrega: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        }
        confirmText="Confirmar Entrega"
        variant="warning"
        loading={loading}
      />

      {/* Dialog de entrega em lote */}
      <ConfirmDialog
        isOpen={loteDialog.isOpen}
        onClose={() => setLoteDialog({ isOpen: false, dataEntrega: new Date().toISOString().split("T")[0] })}
        onConfirm={handleMarcarEntregasEmLote}
        title="Registrar Entregas em Lote"
        message={
          <div className="space-y-4">
            <p>Deseja registrar a entrega de <strong>{selectedIds.length}</strong> especialidade(s)?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Entrega
              </label>
              <input
                type="date"
                value={loteDialog.dataEntrega}
                onChange={(e) => setLoteDialog((prev) => ({ ...prev, dataEntrega: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        }
        confirmText="Confirmar Entregas"
        variant="warning"
        loading={loading}
      />
    </div>
  );
}
