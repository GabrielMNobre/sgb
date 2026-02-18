"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { ClientePaes } from "@/types/paes";
import { Pencil, ToggleLeft, ToggleRight, Users } from "lucide-react";
import Link from "next/link";

interface ClientesPaesTableProps {
  clientes: ClientePaes[];
  basePath: string;
  onEdit?: (cliente: ClientePaes) => void;
  onToggleAtivo?: (id: string) => void;
}

export function ClientesPaesTable({
  clientes,
  basePath,
  onEdit,
  onToggleAtivo,
}: ClientesPaesTableProps) {
  if (clientes.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente encontrado"
        description="Cadastre um novo cliente para começar."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow key={cliente.id}>
            <TableCell className="font-medium truncate max-w-[120px] sm:max-w-none">
              <Link href={`${basePath}/${cliente.id}`} className="hover:underline">
                {cliente.nome}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={cliente.ativo ? "success" : "secondary"}>
                {cliente.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1 sm:gap-2">
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(cliente)} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onToggleAtivo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleAtivo(cliente.id)}
                    title={cliente.ativo ? "Inativar" : "Ativar"}
                  >
                    {cliente.ativo ? (
                      <ToggleRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
