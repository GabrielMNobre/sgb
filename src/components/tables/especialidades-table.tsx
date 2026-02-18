"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, ToggleLeft, ToggleRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
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
import type { Especialidade } from "@/types/especialidade";

interface EspecialidadesTableProps {
  especialidades: Especialidade[];
  basePath: string;
  onToggleStatus: (id: string, ativa: boolean) => Promise<void>;
}

export function EspecialidadesTable({
  especialidades,
  basePath,
  onToggleStatus,
}: EspecialidadesTableProps) {
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");

  // Get unique categories from the data
  const categoriaOptions = [
    { value: "", label: "Todas as categorias" },
    ...Array.from(new Set(especialidades.map((e) => e.categoria)))
      .filter(Boolean)
      .sort()
      .map((cat) => ({ value: cat, label: cat })),
  ];
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    especialidade: Especialidade | null;
  }>({ isOpen: false, especialidade: null });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const especialidadesFiltradas = especialidades.filter((e) => {
    const matchBusca = e.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = !categoriaFiltro || e.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  const handleToggleStatus = async () => {
    if (!confirmDialog.especialidade) return;

    setLoading(true);
    try {
      await onToggleStatus(
        confirmDialog.especialidade.id,
        !confirmDialog.especialidade.ativa
      );
      success(
        confirmDialog.especialidade.ativa
          ? "Especialidade inativada com sucesso"
          : "Especialidade ativada com sucesso"
      );
      router.refresh();
    } catch (err) {
      error("Erro ao alterar status da especialidade");
    } finally {
      setLoading(false);
      setConfirmDialog({ isOpen: false, especialidade: null });
    }
  };

  if (especialidades.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="Nenhuma especialidade cadastrada"
        description="Comece criando a primeira especialidade do catálogo"
        action={
          <Link href={`${basePath}/nova`}>
            <Button>Criar Especialidade</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
        <SearchInput
          placeholder="Buscar especialidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onClear={() => setBusca("")}
          className="flex-1 max-w-sm"
        />
        <Select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          options={categoriaOptions}
          className="sm:w-64"
        />
      </div>

      {especialidadesFiltradas.length === 0 ? (
        <EmptyState
          title="Nenhuma especialidade encontrada"
          description="Tente buscar por outro termo ou altere o filtro de categoria"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {especialidadesFiltradas.map((especialidade) => (
              <TableRow key={especialidade.id}>
                <TableCell className="font-medium">
                  <span className="truncate max-w-[120px] sm:max-w-none block">{especialidade.nome}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline">
                    {especialidade.categoria}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={especialidade.ativa ? "success" : "error"}>
                    {especialidade.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
                    <Link href={`${basePath}/${especialidade.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setConfirmDialog({ isOpen: true, especialidade })
                      }
                    >
                      {especialidade.ativa ? (
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
        onClose={() => setConfirmDialog({ isOpen: false, especialidade: null })}
        onConfirm={handleToggleStatus}
        title={
          confirmDialog.especialidade?.ativa ? "Inativar Especialidade" : "Ativar Especialidade"
        }
        message={
          confirmDialog.especialidade?.ativa
            ? "Ao inativar esta especialidade, ela não aparecerá mais para registro de conquistas. Deseja continuar?"
            : "Deseja ativar esta especialidade?"
        }
        confirmText={confirmDialog.especialidade?.ativa ? "Inativar" : "Ativar"}
        variant={confirmDialog.especialidade?.ativa ? "danger" : "warning"}
        loading={loading}
      />
    </div>
  );
}
