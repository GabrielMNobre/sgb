"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { CreditoPaes } from "@/types/paes";
import { Gift } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

interface CreditosPaesTableProps {
  creditos: CreditoPaes[];
}

export function CreditosPaesTable({ creditos }: CreditosPaesTableProps) {
  if (creditos.length === 0) {
    return (
      <EmptyState
        icon={Gift}
        title="Nenhum crédito encontrado"
        description="Créditos são gerados quando pedidos não são entregues."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Qtd Original</TableHead>
          <TableHead className="text-center">Disponível</TableHead>
          <TableHead className="hidden sm:table-cell">Data</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {creditos.map((credito) => (
          <TableRow key={credito.id}>
            <TableCell className="text-center">{credito.quantidadeOriginal}</TableCell>
            <TableCell className="text-center font-semibold">{credito.quantidadeDisponivel}</TableCell>
            <TableCell className="hidden sm:table-cell whitespace-nowrap">
              {formatDate(credito.criadoEm)}
            </TableCell>
            <TableCell>
              <Badge variant={credito.quantidadeDisponivel > 0 ? "success" : "secondary"}>
                {credito.quantidadeDisponivel > 0 ? "Disponível" : "Utilizado"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
