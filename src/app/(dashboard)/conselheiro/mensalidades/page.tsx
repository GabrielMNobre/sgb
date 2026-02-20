"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, ShieldCheck } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import { MESES_LABELS } from "@/lib/constants";
import type { MensalidadeComRelacoes } from "@/types/mensalidade";

function formatCurrency(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface MembroIsento {
  id: string;
  nome: string;
  tipo: string;
}

export default function MensalidadesConselheiroPage() {
  const hoje = new Date();
  const [mes, setMes] = useState<number>(hoje.getMonth() + 1);
  const [ano, setAno] = useState<number>(hoje.getFullYear());
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [mensalidades, setMensalidades] = useState<MensalidadeComRelacoes[]>(
    []
  );
  const [isentos, setIsentos] = useState<MembroIsento[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("mes", String(mes));
      params.set("ano", String(ano));
      if (statusFiltro) params.set("status", statusFiltro);

      const res = await fetch(
        `/api/conselheiro/mensalidades?${params.toString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setMensalidades(data.mensalidades || []);
        setIsentos(data.isentos || []);
      }
    } catch (err) {
      console.error("Erro ao carregar mensalidades:", err);
    } finally {
      setLoading(false);
    }
  }, [mes, ano, statusFiltro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const pagos = mensalidades.filter((m) => m.status === "pago").length;
  const pendentes = mensalidades.filter((m) => m.status === "pendente").length;

  const anoAtual = hoje.getFullYear();
  const anos = [anoAtual, anoAtual - 1];

  const showIsentos = statusFiltro === "" || statusFiltro === "isento";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Mensalidades
        </h1>
        <p className="text-sm sm:text-base font-medium" style={{ color: "var(--unit-primary)" }}>
          Acompanhamento de mensalidades da unidade (somente leitura)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {Object.entries(MESES_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="isento">Isento</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Total</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--unit-primary)" }}>
              {mensalidades.length + isentos.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Pagos</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {pagos}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Pendentes</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">
              {pendentes}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Isentos</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {isentos.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center py-12">
              <Loading size="lg" />
              <p className="text-gray-500 mt-3">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      ) : mensalidades.length === 0 && isentos.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                Nenhuma mensalidade encontrada para o periodo selecionado
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Nome</th>
                    <th className="pb-3 font-medium">Valor</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Data Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {statusFiltro !== "isento" && mensalidades.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{m.membro.nome}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {m.membro.tipo === "diretoria" ? "conselheiro" : m.membro.tipo}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">{formatCurrency(m.valor)}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            m.status === "pago" ? "success" : "warning"
                          }
                        >
                          {m.status === "pago" ? "Pago" : "Pendente"}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">
                        {m.dataPagamento
                          ? formatDate(m.dataPagamento)
                          : "\u2014"}
                      </td>
                    </tr>
                  ))}
                  {showIsentos && isentos.map((m) => (
                    <tr
                      key={`isento-${m.id}`}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{m.nome}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {m.tipo === "diretoria" ? "conselheiro" : m.tipo}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 text-gray-400">{"\u2014"}</td>
                      <td className="py-3">
                        <Badge variant="secondary">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Isento
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-400">{"\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {statusFiltro !== "isento" && mensalidades.map((m) => (
                <div
                  key={m.id}
                  className="border rounded-lg p-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{m.membro.nome}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {m.membro.tipo === "diretoria" ? "conselheiro" : m.membro.tipo}
                      </p>
                    </div>
                    <Badge
                      variant={
                        m.status === "pago" ? "success" : "warning"
                      }
                    >
                      {m.status === "pago" ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {formatCurrency(m.valor)}
                    </span>
                    <span className="text-gray-500">
                      {m.dataPagamento
                        ? formatDate(m.dataPagamento)
                        : "\u2014"}
                    </span>
                  </div>
                </div>
              ))}
              {showIsentos && isentos.map((m) => (
                <div
                  key={`isento-${m.id}`}
                  className="border rounded-lg p-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{m.nome}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {m.tipo === "diretoria" ? "conselheiro" : m.tipo}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Isento
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
