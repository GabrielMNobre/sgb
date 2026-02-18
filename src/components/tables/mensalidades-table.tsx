"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RegistrarPagamentoModal } from "@/components/forms/registrar-pagamento-modal";
import { MESES_LABELS } from "@/lib/constants";
import type { MensalidadeComRelacoes, RegistrarPagamentoFormData } from "@/types/mensalidade";
import type { Unidade } from "@/types/unidade";
import { formatDate } from "@/lib/utils/date";

interface MensalidadesTableProps {
  mensalidades: MensalidadeComRelacoes[];
  unidades: Unidade[];
  basePath: string;
  onRegistrarPagamento: (data: RegistrarPagamentoFormData) => Promise<void>;
  onEstornarPagamento: (id: string) => Promise<void>;
  readonly?: boolean;
}

export function MensalidadesTable({
  mensalidades,
  unidades,
  basePath,
  onRegistrarPagamento,
  onEstornarPagamento,
  readonly = false,
}: MensalidadesTableProps) {
  const router = useRouter();

  // Filter states
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("");

  // Selection states
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

  // Modal states
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [estornarConfirm, setEstornarConfirm] = useState<{
    isOpen: boolean;
    mensalidadeId: string | null;
  }>({ isOpen: false, mensalidadeId: null });

  const [loading, setLoading] = useState(false);

  // Filter options
  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "pago", label: "Pago" },
    { value: "pendente", label: "Pendente" },
    { value: "isento", label: "Isento" },
  ];

  const tipoOptions = [
    { value: "", label: "Todos os tipos" },
    { value: "desbravador", label: "Desbravador" },
    { value: "diretoria", label: "Diretoria" },
  ];

  const unidadeOptions = [
    { value: "", label: "Todas as unidades" },
    ...unidades.map((u) => ({ value: u.id, label: u.nome })),
  ];

  // Filtering logic
  const mensalidadesFiltradas = mensalidades.filter((m) => {
    if (busca && !m.membro.nome.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }

    // Handle exempt members and status filter
    if (m.membro.isentoMensalidade) {
      return filtroStatus === "" || filtroStatus === "isento";
    }

    if (filtroStatus && filtroStatus !== "isento" && m.status !== filtroStatus) {
      return false;
    }

    if (filtroStatus === "isento" && !m.membro.isentoMensalidade) {
      return false;
    }

    if (filtroTipo && m.membro.tipo !== filtroTipo) {
      return false;
    }

    if (filtroUnidade && m.membro.unidade?.id !== filtroUnidade) {
      return false;
    }

    return true;
  });

  // Selection handlers
  const handleToggleAll = () => {
    if (selecionadas.size === mensalidadesFiltradas.filter(m => !m.membro.isentoMensalidade && m.status === "pendente").length) {
      setSelecionadas(new Set());
    } else {
      const novasSelecionadas = new Set(
        mensalidadesFiltradas
          .filter(m => !m.membro.isentoMensalidade && m.status === "pendente")
          .map(m => m.id)
      );
      setSelecionadas(novasSelecionadas);
    }
  };

  const handleToggle = (id: string) => {
    const novasSelecionadas = new Set(selecionadas);
    if (novasSelecionadas.has(id)) {
      novasSelecionadas.delete(id);
    } else {
      novasSelecionadas.add(id);
    }
    setSelecionadas(novasSelecionadas);
  };

  // Payment registration handlers
  const handleRegistrarPagamentos = async (data: RegistrarPagamentoFormData) => {
    setLoading(true);
    try {
      await onRegistrarPagamento(data);
      setSelecionadas(new Set());
      setPagamentoModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao registrar pagamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEstornar = async () => {
    if (!estornarConfirm.mensalidadeId) return;

    setLoading(true);
    try {
      await onEstornarPagamento(estornarConfirm.mensalidadeId);
      setEstornarConfirm({ isOpen: false, mensalidadeId: null });
      router.refresh();
    } catch (error) {
      console.error("Erro ao estornar pagamento:", error);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatMonthYear = (mes: number, ano: number) =>
    `${MESES_LABELS[mes]}/${ano}`;

  const getBadgeVariant = (status: string, isento: boolean) => {
    if (isento) return "default";
    if (status === "pago") return "success";
    return "error";
  };

  const getBadgeLabel = (status: string, isento: boolean) => {
    if (isento) return "Isento";
    if (status === "pago") return "Pago";
    return "Pendente";
  };

  // Calculate selected totals
  const selecionadasArray = mensalidadesFiltradas.filter(m =>
    selecionadas.has(m.id)
  );
  const valorTotalSelecionadas = selecionadasArray.reduce(
    (sum, m) => sum + m.valor,
    0
  );

  // Clear filters
  const hasFilters = busca || filtroStatus || filtroTipo || filtroUnidade;
  const clearFilters = () => {
    setBusca("");
    setFiltroStatus("");
    setFiltroTipo("");
    setFiltroUnidade("");
  };

  if (mensalidades.length === 0) {
    return (
      <EmptyState
        icon={XCircle}
        title="Nenhuma mensalidade encontrada"
        description="As mensalidades serão geradas automaticamente ao acessar o mês desejado"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <SearchInput
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onClear={() => setBusca("")}
          className="w-full md:w-64"
        />

        <Select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          options={statusOptions}
          className="w-full md:w-40"
        />

        <Select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          options={tipoOptions}
          className="w-full md:w-40"
        />

        <Select
          value={filtroUnidade}
          onChange={(e) => setFiltroUnidade(e.target.value)}
          options={unidadeOptions}
          className="w-full md:w-48"
        />
      </div>

      {/* Results info and clear filters */}
      {hasFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {mensalidadesFiltradas.length} de {mensalidades.length}{" "}
            mensalidades
          </p>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      )}

      {/* Bulk actions */}
      {!readonly && selecionadas.size > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">
              {selecionadas.size} mensalidade(s) selecionada(s)
            </p>
            <p className="text-xs text-blue-700">
              Total: {formatCurrency(valorTotalSelecionadas)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setPagamentoModalOpen(true)}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Registrar Pagamentos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelecionadas(new Set())}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {mensalidadesFiltradas.length === 0 ? (
        <EmptyState
          title="Nenhuma mensalidade encontrada"
          description="Tente ajustar os filtros de busca"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {!readonly && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selecionadas.size > 0 &&
                        selecionadas.size ===
                          mensalidadesFiltradas.filter(
                            (m) =>
                              !m.membro.isentoMensalidade &&
                              m.status === "pendente"
                          ).length
                      }
                      onChange={handleToggleAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membro
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mês/Ano
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Pagamento
                </th>
                {!readonly && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mensalidadesFiltradas.map((mensalidade) => (
                <tr
                  key={mensalidade.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {!readonly && (
                    <td className="px-4 py-3">
                      {!mensalidade.membro.isentoMensalidade &&
                        mensalidade.status === "pendente" && (
                          <input
                            type="checkbox"
                            checked={selecionadas.has(mensalidade.id)}
                            onChange={() => handleToggle(mensalidade.id)}
                            className="rounded border-gray-300"
                          />
                        )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="truncate max-w-[120px] sm:max-w-none font-medium">
                      {mensalidade.membro.nome}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 sm:hidden">
                      {formatMonthYear(mensalidade.mes, mensalidade.ano)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 md:hidden capitalize">
                      {mensalidade.membro.tipo}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500 capitalize">
                    {mensalidade.membro.tipo}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500">
                    {mensalidade.membro.unidade?.nome || "Diretoria"}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-500">
                    {formatMonthYear(mensalidade.mes, mensalidade.ano)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {formatCurrency(mensalidade.valor)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={getBadgeVariant(
                        mensalidade.status,
                        mensalidade.membro.isentoMensalidade
                      )}
                      className={
                        mensalidade.membro.isentoMensalidade
                          ? "bg-gray-100 text-gray-600"
                          : ""
                      }
                    >
                      {getBadgeLabel(
                        mensalidade.status,
                        mensalidade.membro.isentoMensalidade
                      )}
                    </Badge>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-500">
                    {formatDate(mensalidade.dataPagamento)}
                  </td>
                  {!readonly && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {/* View history */}
                        <Link href={`${basePath}/${mensalidade.membroId}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Ver histórico"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {/* Register payment (single) */}
                        {!mensalidade.membro.isentoMensalidade &&
                          mensalidade.status === "pendente" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelecionadas(new Set([mensalidade.id]));
                                setPagamentoModalOpen(true);
                              }}
                              title="Registrar pagamento"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}

                        {/* Reverse payment */}
                        {!mensalidade.membro.isentoMensalidade &&
                          mensalidade.status === "pago" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setEstornarConfirm({
                                  isOpen: true,
                                  mensalidadeId: mensalidade.id,
                                })
                              }
                              title="Estornar pagamento"
                            >
                              <RotateCcw className="h-4 w-4 text-orange-600" />
                            </Button>
                          )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {!readonly && (
        <>
          <RegistrarPagamentoModal
            isOpen={pagamentoModalOpen}
            onClose={() => {
              setPagamentoModalOpen(false);
              setSelecionadas(new Set());
            }}
            mensalidadeIds={Array.from(selecionadas)}
            quantidadeSelecionada={selecionadas.size}
            valorTotal={valorTotalSelecionadas}
            onSubmit={handleRegistrarPagamentos}
          />

          <ConfirmDialog
            isOpen={estornarConfirm.isOpen}
            onClose={() =>
              setEstornarConfirm({ isOpen: false, mensalidadeId: null })
            }
            onConfirm={handleEstornar}
            title="Estornar Pagamento"
            message="Tem certeza que deseja estornar este pagamento? O status voltará para pendente."
            confirmText="Estornar"
            variant="warning"
            loading={loading}
          />
        </>
      )}
    </div>
  );
}
