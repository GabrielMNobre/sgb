"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UsuarioComMembro } from "@/services/usuarios";
import { Users } from "lucide-react";

interface UsuariosTableProps {
  usuarios: UsuarioComMembro[];
}

export function UsuariosTable({ usuarios }: UsuariosTableProps) {
  const [busca, setBusca] = useState("");
  const [papelFiltro, setPapelFiltro] = useState("");

  const papelOptions = [
    { value: "", label: "Todos os papéis" },
    { value: "admin", label: "Admin" },
    { value: "secretaria", label: "Secretaria" },
    { value: "tesoureiro", label: "Tesoureiro" },
    { value: "conselheiro", label: "Conselheiro" },
  ];

  const usuariosFiltrados = usuarios.filter((u) => {
    if (busca && !u.nome.toLowerCase().includes(busca.toLowerCase()) && !u.email.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }
    if (papelFiltro && u.papel !== papelFiltro) {
      return false;
    }
    return true;
  });

  const getPapelLabel = (papel: string) => {
    const mapping: Record<string, string> = {
      admin: "Admin",
      secretaria: "Secretaria",
      tesoureiro: "Tesoureiro",
      conselheiro: "Conselheiro",
    };
    return mapping[papel] || papel;
  };

  const getPapelVariant = (papel: string): "default" | "success" | "warning" | "error" | "outline" => {
    const mapping: Record<string, "default" | "success" | "warning" | "error" | "outline"> = {
      admin: "error",
      secretaria: "default",
      tesoureiro: "warning",
      conselheiro: "success",
    };
    return mapping[papel] || "default";
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
        <SearchInput
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onClear={() => setBusca("")}
          placeholder="Buscar por nome ou email..."
          className="sm:flex-1"
        />
        <Select
          value={papelFiltro}
          onChange={(e) => setPapelFiltro(e.target.value)}
          options={papelOptions}
          className="sm:w-64"
        />
      </div>

      {usuarios.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum usuário cadastrado"
          description="Não há usuários no sistema"
        />
      ) : usuariosFiltrados.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Ajuste os filtros para encontrar usuários"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead className="hidden sm:table-cell">Membro Vinculado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuariosFiltrados.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">
                  <span className="truncate max-w-[120px] sm:max-w-none block">{usuario.nome}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-gray-500">{usuario.email}</TableCell>
                <TableCell>
                  <Badge variant={getPapelVariant(usuario.papel)}>
                    {getPapelLabel(usuario.papel)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {usuario.membroNome || <span className="text-gray-400 italic">-</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.ativo ? "success" : "error"}>
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
                    <Link href={`/secretaria/usuarios/${usuario.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
