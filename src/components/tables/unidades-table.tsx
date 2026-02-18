"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, ToggleLeft, ToggleRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
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
import type { Unidade } from "@/types/unidade";

interface UnidadesTableProps {
  unidades: Unidade[];
  basePath: string;
  onToggleStatus: (id: string, ativa: boolean) => Promise<void>;
}

export function UnidadesTable({ unidades, basePath, onToggleStatus }: UnidadesTableProps) {
  const [busca, setBusca] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    unidade: Unidade | null;
  }>({ isOpen: false, unidade: null });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const unidadesFiltradas = unidades.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const handleToggleStatus = async () => {
    if (!confirmDialog.unidade) return;

    setLoading(true);
    try {
      await onToggleStatus(confirmDialog.unidade.id, !confirmDialog.unidade.ativa);
      success(
        confirmDialog.unidade.ativa
          ? "Unidade inativada com sucesso"
          : "Unidade ativada com sucesso"
      );
      router.refresh();
    } catch (err) {
      error("Erro ao alterar status da unidade");
    } finally {
      setLoading(false);
      setConfirmDialog({ isOpen: false, unidade: null });
    }
  };

  if (unidades.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Nenhuma unidade cadastrada"
        description="Comece criando a primeira unidade do clube"
        action={
          <Link href={`${basePath}/nova`}>
            <Button>Criar Unidade</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border-b">
        <SearchInput
          placeholder="Buscar unidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onClear={() => setBusca("")}
          className="max-w-sm"
        />
      </div>

      {unidadesFiltradas.length === 0 ? (
        <EmptyState
          title="Nenhuma unidade encontrada"
          description="Tente buscar por outro termo"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Cores</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unidadesFiltradas.map((unidade) => (
              <TableRow key={unidade.id}>
                <TableCell className="font-medium">
                  <span className="truncate max-w-[120px] sm:max-w-none block">{unidade.nome}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: unidade.corPrimaria }}
                      title={`Primária: ${unidade.corPrimaria}`}
                    />
                    <div
                      className="h-6 w-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: unidade.corSecundaria }}
                      title={`Secundária: ${unidade.corSecundaria}`}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={unidade.ativa ? "success" : "error"}>
                    {unidade.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
                    <Link href={`${basePath}/${unidade.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setConfirmDialog({ isOpen: true, unidade })
                      }
                    >
                      {unidade.ativa ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, unidade: null })}
        onConfirm={handleToggleStatus}
        title={
          confirmDialog.unidade?.ativa ? "Inativar Unidade" : "Ativar Unidade"
        }
        message={
          confirmDialog.unidade?.ativa
            ? "Ao inativar esta unidade, os membros vinculados ficarão sem unidade. Deseja continuar?"
            : "Deseja ativar esta unidade?"
        }
        confirmText={confirmDialog.unidade?.ativa ? "Inativar" : "Ativar"}
        variant={confirmDialog.unidade?.ativa ? "danger" : "warning"}
        loading={loading}
      />
    </div>
  );
}
