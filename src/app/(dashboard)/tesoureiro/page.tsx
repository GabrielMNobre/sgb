import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calcularTotaisMensalidade,
  calcularMetaMensal,
  calcularTaxaAdesao,
  contarInadimplentes,
  obterTop10Inadimplentes,
  obterReceitaUltimosSeisMeses,
} from "@/services/mensalidades";
import { calcularTotalMesAtual, getUltimosGastos } from "@/services/gastos";

export default async function TesoureiroPage() {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const [totais, meta, taxas, totalInadimplentes, inadimplentes, receita, totalGastosMes, ultimosGastos] = await Promise.all([
    calcularTotaisMensalidade(mesAtual, anoAtual),
    calcularMetaMensal(mesAtual, anoAtual),
    calcularTaxaAdesao(mesAtual, anoAtual),
    contarInadimplentes(),
    obterTop10Inadimplentes(),
    obterReceitaUltimosSeisMeses(),
    calcularTotalMesAtual(),
    getUltimosGastos(5),
  ]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const getMetaColor = (percentual: number) => {
    if (percentual >= 80) return { bg: "bg-green-100", text: "text-green-800", icon: "text-green-600" };
    if (percentual >= 50) return { bg: "bg-yellow-100", text: "text-yellow-800", icon: "text-yellow-600" };
    return { bg: "bg-red-100", text: "text-red-800", icon: "text-red-600" };
  };

  const metaColors = getMetaColor(meta.percentualAlcancado);
  const saldoMes = totais.totalPago - totalGastosMes;
  const saldoPositivo = saldoMes >= 0;

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("pt-BR").format(new Date(date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard - Tesoureiro
        </h1>
        <p className="text-gray-500">Controle financeiro do clube</p>
      </div>

      {/* Revenue summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Arrecadado
                </p>
                <p className="text-3xl font-bold text-success">
                  {formatCurrency(totais.totalPago)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {totais.quantidadePaga} pagamento(s)
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Pendente
                </p>
                <p className="text-3xl font-bold text-warning">
                  {formatCurrency(totais.totalPendente)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {totais.quantidadePendente} pendência(s)
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Inadimplentes
                </p>
                <p className="text-3xl font-bold text-error">
                  {totalInadimplentes}
                </p>
                <p className="text-xs text-gray-500 mt-2">membros em atraso</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly goal card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Meta Mensal ({meta.mes}/{meta.ano})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Arrecadado</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(meta.valorArrecadado)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Meta (80%)</p>
                <p className="text-2xl font-bold text-gray-700">
                  {formatCurrency(meta.valorMeta)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Possível (100%)</p>
                <p className="text-2xl font-bold text-gray-400">
                  {formatCurrency(meta.valorPossivel)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progresso</span>
                <span className={`font-bold ${metaColors.text}`}>
                  {meta.percentualAlcancado.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${metaColors.bg} transition-all duration-300`}
                  style={{
                    width: `${Math.min(meta.percentualAlcancado, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {meta.membrosPagos} de {meta.membrosAtivos} membros pagaram
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adhesion rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {taxas.map((taxa) => (
          <Card key={taxa.tipo}>
            <CardHeader>
              <CardTitle className="capitalize">
                Taxa de Adesão - {taxa.tipo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-primary">
                    {taxa.percentualAdesao.toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {taxa.totalPago} de {taxa.totalAtivos} pagaram
                  </p>
                  {taxa.totalPendente > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {taxa.totalPendente} pendente(s)
                    </p>
                  )}
                </div>
                <div
                  className={`h-24 w-24 rounded-full flex items-center justify-center ${
                    taxa.percentualAdesao >= 80
                      ? "bg-green-100"
                      : taxa.percentualAdesao >= 50
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
                >
                  <span
                    className={`text-2xl font-bold ${
                      taxa.percentualAdesao >= 80
                        ? "text-green-700"
                        : taxa.percentualAdesao >= 50
                        ? "text-yellow-700"
                        : "text-red-700"
                    }`}
                  >
                    {taxa.totalPago}/{taxa.totalAtivos}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart (simplified) */}
      <Card>
        <CardHeader>
          <CardTitle>Arrecadação dos Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {receita.map((mes) => (
              <div key={`${mes.ano}-${mes.mes}`} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {mes.mesNome}/{mes.ano}
                  </span>
                  <span className="font-bold text-primary">
                    {formatCurrency(mes.totalGeral)}
                  </span>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{
                      width: `${
                        mes.totalGeral > 0
                          ? (mes.totalDesbravadores / mes.totalGeral) * 100
                          : 0
                      }%`,
                    }}
                    title={`Desbravadores: ${formatCurrency(
                      mes.totalDesbravadores
                    )}`}
                  >
                    {mes.totalDesbravadores > 0 &&
                      formatCurrency(mes.totalDesbravadores)}
                  </div>
                  <div
                    className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{
                      width: `${
                        mes.totalGeral > 0
                          ? (mes.totalDiretoria / mes.totalGeral) * 100
                          : 0
                      }%`,
                    }}
                    title={`Diretoria: ${formatCurrency(mes.totalDiretoria)}`}
                  >
                    {mes.totalDiretoria > 0 &&
                      formatCurrency(mes.totalDiretoria)}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-4 pt-2 border-t text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-blue-500 rounded" />
                <span>Desbravadores</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded" />
                <span>Diretoria</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gastos e Saldo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Gastos no Mês
                </p>
                <p className="text-3xl font-bold text-error">
                  {formatCurrency(totalGastosMes)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {ultimosGastos.length} gasto(s) recente(s)
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Saldo do Mês
                </p>
                <p
                  className={`text-3xl font-bold ${
                    saldoPositivo ? "text-success" : "text-error"
                  }`}
                >
                  {formatCurrency(saldoMes)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Arrecadado - Gastos
                </p>
              </div>
              <div
                className={`h-12 w-12 ${
                  saldoPositivo ? "bg-green-100" : "bg-red-100"
                } rounded-full flex items-center justify-center`}
              >
                <Wallet
                  className={`h-6 w-6 ${
                    saldoPositivo ? "text-success" : "text-error"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimos Gastos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Últimos Gastos</CardTitle>
            <Link href="/tesoureiro/gastos">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {ultimosGastos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum gasto registrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ultimosGastos.map((gasto) => (
                <div
                  key={gasto.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {gasto.descricao}
                    </p>
                    <p className="text-xs text-gray-500">
                      {gasto.evento?.nome || "Sem evento"} •{" "}
                      {formatDate(gasto.data)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(gasto.valor)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 10 delinquents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Maiores Inadimplentes</CardTitle>
            <Link href="/tesoureiro/mensalidades">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {inadimplentes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Não há inadimplentes no momento! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inadimplentes.map((membro) => (
                <div
                  key={membro.membroId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-red-700">
                        {membro.quantidadePendente}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {membro.membroNome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {membro.unidade?.nome || "Diretoria"} •{" "}
                        {membro.mesesPendentes.join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(membro.valorPendente)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {membro.tipo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
