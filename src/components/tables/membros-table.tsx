"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, ToggleLeft, ToggleRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
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
import type { MembroComRelacoes, Classe } from "@/types/membro";
import type { Unidade } from "@/types/unidade";

interface MembrosTableProps {
  membros: MembroComRelacoes[];
  unidades: Unidade[];
  classes: Classe[];
  basePath: string;
  onToggleStatus: (id: string, ativo: boolean) => Promise<void>;
}

export function MembrosTable({
  membros,
  unidades,
  classes,
  basePath,
  onToggleStatus,
}: MembrosTableProps) {
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [filtroClasse, setFiltroClasse] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    membro: MembroComRelacoes | null;
  }>({ isOpen: false, membro: null });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const membrosFiltrados = membros.filter((m) => {
    if (busca && !m.nome.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }
    if (filtroTipo && m.tipo !== filtroTipo) {
      return false;
    }
    if (filtroUnidade && m.unidadeId !== filtroUnidade) {
      return false;
    }
    if (filtroClasse && m.classeId !== filtroClasse) {
      return false;
    }
    if (filtroStatus === "ativo" && !m.ativo) {
      return false;
    }
    if (filtroStatus === "inativo" && m.ativo) {
      return false;
    }
    return true;
  });

  const handleToggleStatus = async () => {
    if (!confirmDialog.membro) return;

    setLoading(true);
    try {
      await onToggleStatus(confirmDialog.membro.id, !confirmDialog.membro.ativo);
      success(
        confirmDialog.membro.ativo
          ? "Membro inativado com sucesso"
          : "Membro ativado com sucesso"
      );
      router.refresh();
    } catch (err) {
      error("Erro ao alterar status do membro");
    } finally {
      setLoading(false);
      setConfirmDialog({ isOpen: false, membro: null });
    }
  };

  const clearFilters = () => {
    setBusca("");
    setFiltroTipo("");
    setFiltroUnidade("");
    setFiltroClasse("");
    setFiltroStatus("");
  };

  const hasFilters = busca || filtroTipo || filtroUnidade || filtroClasse || filtroStatus;

  if (membros.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum membro cadastrado"
        description="Comece cadastrando o primeiro membro do clube"
        action={
          <Link href={`${basePath}/novo`}>
            <Button>Cadastrar Membro</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border-b space-y-4">
        <div className="flex flex-wrap gap-4">
          <SearchInput
            placeholder="Buscar membro..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onClear={() => setBusca("")}
            className="w-full md:w-64"
          />

          <Select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            options={[
              { value: "", label: "Todos os tipos" },
              { value: "desbravador", label: "Desbravador" },
              { value: "diretoria", label: "Diretoria" },
            ]}
            className="w-full md:w-40"
          />

          <Select
            value={filtroUnidade}
            onChange={(e) => setFiltroUnidade(e.target.value)}
            options={[
              { value: "", label: "Todas as unidades" },
              ...unidades.map((u) => ({ value: u.id, label: u.nome })),
            ]}
            className="w-full md:w-48"
          />

          <Select
            value={filtroClasse}
            onChange={(e) => setFiltroClasse(e.target.value)}
            options={[
              { value: "", label: "Todas as classes" },
              ...classes.map((c) => ({ value: c.id, label: c.nome })),
            ]}
            className="w-full md:w-40"
          />

          <Select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            options={[
              { value: "", label: "Todos os status" },
              { value: "ativo", label: "Ativos" },
              { value: "inativo", label: "Inativos" },
            ]}
            className="w-full md:w-36"
          />
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {membrosFiltrados.length} de {membros.length} membros
            </p>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      {membrosFiltrados.length === 0 ? (
        <EmptyState
          title="Nenhum membro encontrado"
          description="Tente ajustar os filtros ou buscar por outro termo"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Classe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membrosFiltrados.map((membro) => (
              <TableRow key={membro.id}>
                <TableCell className="font-medium">{membro.nome}</TableCell>
                <TableCell>
                  <Badge variant={membro.tipo === "desbravador" ? "default" : "outline"}>
                    {membro.tipo === "desbravador" ? "Desbravador" : "Diretoria"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {membro.unidade ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: membro.unidade.corPrimaria }}
                      />
                      {membro.unidade.nome}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {membro.classe?.nome || (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={membro.ativo ? "success" : "error"}>
                    {membro.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`${basePath}/${membro.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDialog({ isOpen: true, membro })}
                    >
                      {membro.ativo ? (
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
        onClose={() => setConfirmDialog({ isOpen: false, membro: null })}
        onConfirm={handleToggleStatus}
        title={confirmDialog.membro?.ativo ? "Inativar Membro" : "Ativar Membro"}
        message={
          confirmDialog.membro?.ativo
            ? "Ao inativar este membro, ele não aparecerá na chamada. Deseja continuar?"
            : "Deseja ativar este membro?"
        }
        confirmText={confirmDialog.membro?.ativo ? "Inativar" : "Ativar"}
        variant={confirmDialog.membro?.ativo ? "danger" : "warning"}
        loading={loading}
      />
    </div>
  );
}
