import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMembroById } from "@/services/membros";
import { obterHistoricoMembro } from "@/services/mensalidades";
import { MESES_LABELS } from "@/lib/constants";

export default async function MembroMensalidadesPage({
  params,
}: {
  params: Promise<{ membroId: string }>;
}) {
  const { membroId } = await params;
  const [membro, historico] = await Promise.all([
    getMembroById(membroId),
    obterHistoricoMembro(membroId),
  ]);

  if (!membro) {
    notFound();
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  const valorMensalidade =
    membro.tipo === "desbravador" ? "R$ 30,00" : "R$ 50,00";
  const statusGeral = membro.isentoMensalidade
    ? "Isento"
    : historico.some((h) => h.quantidadePendente > 0)
    ? "Inadimplente"
    : "Em dia";

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href="/tesoureiro/mensalidades">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Histórico de Mensalidades
          </h1>
          <p className="text-gray-500">Pagamentos de {membro.nome}</p>
        </div>
      </div>

      {/* Member info card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="text-base font-semibold text-gray-900">
                  {membro.nome}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo</p>
                <p className="text-base text-gray-900 capitalize">
                  {membro.tipo}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Unidade</p>
                <p className="text-base text-gray-900">
                  {membro.unidade?.nome || "Diretoria"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Valor Mensalidade
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {membro.isentoMensalidade ? "Isento" : valorMensalidade}
                </p>
              </div>
            </div>
            <div>
              <Badge
                variant={
                  membro.isentoMensalidade
                    ? "default"
                    : statusGeral === "Em dia"
                    ? "success"
                    : "error"
                }
                className={
                  membro.isentoMensalidade
                    ? "bg-gray-100 text-gray-600"
                    : ""
                }
              >
                {statusGeral}
              </Badge>
            </div>
          </div>

          {membro.isentoMensalidade && membro.motivoIsencao && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                Motivo da isenção:
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {membro.motivoIsencao}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment history by year */}
      {membro.isentoMensalidade ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <p>Este membro está isento de mensalidades.</p>
          </CardContent>
        </Card>
      ) : historico.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <p>Nenhuma mensalidade registrada ainda.</p>
          </CardContent>
        </Card>
      ) : (
        historico.map((ano) => (
          <Card key={ano.ano}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ano {ano.ano}</CardTitle>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">
                    Pago: {formatCurrency(ano.totalPago)}
                  </span>
                  {ano.totalPendente > 0 && (
                    <span className="text-red-600 font-medium">
                      Pendente: {formatCurrency(ano.totalPendente)}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mês
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Pagamento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ano.meses.map((mes) => (
                      <tr key={mes.mes} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {mes.mesNome}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(mes.valor)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              mes.status === "pago" ? "success" : "error"
                            }
                          >
                            {mes.status === "pago" ? "Pago" : "Pendente"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(mes.dataPagamento)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Year summary */}
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">
                    Total Pago
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(ano.totalPago)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ano.quantidadePaga} mês(es)
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">
                    Total Pendente
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(ano.totalPendente)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ano.quantidadePendente} mês(es)
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Total Ano</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(ano.totalPago + ano.totalPendente)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ano.quantidadePaga + ano.quantidadePendente} mês(es)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
