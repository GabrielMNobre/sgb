import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  ClipboardList,
  Building2,
  DollarSign,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Shirt,
  BookOpen,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import {
  getUnidadeDoConselheiroCompleta,
  getDesbravadoresPorClasseUnidade,
  getEstatisticasPresencaUnidade,
  getMembrosComMaisFaltas,
  getResumoMensalidadesUnidade,
  getMembrosInadimplentesUnidade,
} from "@/services/conselheiro-dashboard";
import {
  getProximoEncontro,
  getEncontroEmAndamento,
} from "@/services/encontros";
import { formatDate } from "@/lib/utils/date";

function getPercentageColor(value: number) {
  if (value >= 80) return "text-green-600";
  if (value >= 50) return "text-amber-600";
  return "text-red-600";
}

export default async function ConselheiroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const unidadeInfo = await getUnidadeDoConselheiroCompleta(user.id);

  if (!unidadeInfo) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Dashboard - Conselheiro
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Visao geral da sua unidade
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">
                Voce nao esta vinculado a nenhuma unidade
              </p>
              <p className="text-sm text-gray-400">
                Entre em contato com a secretaria para ser vinculado a uma
                unidade
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  let classesPorUnidade: { classeNome: string; quantidade: number }[] = [];
  let estatisticasPresenca = {
    taxaPresenca: 0,
    taxaPontualidade: 0,
    taxaMaterial: 0,
    taxaUniforme: 0,
    totalEncontros: 0,
  };
  let membrosComFaltas: {
    membroId: string;
    membroNome: string;
    totalFaltas: number;
    totalEncontros: number;
  }[] = [];
  let resumoMensalidades = {
    totalMembros: 0,
    emDia: 0,
    pendentes: 0,
    isentos: 0,
    desbravadores: { total: 0, emDia: 0, pendentes: 0, isentos: 0 },
    conselheiros: { total: 0, emDia: 0, pendentes: 0, isentos: 0 },
  };
  let membrosInadimplentes: {
    membroId: string;
    membroNome: string;
    mesesPendentes: string[];
  }[] = [];
  let proximoEncontro: Awaited<ReturnType<typeof getProximoEncontro>> = null;
  let encontroEmAndamento: Awaited<
    ReturnType<typeof getEncontroEmAndamento>
  > = null;

  try {
    [
      classesPorUnidade,
      estatisticasPresenca,
      membrosComFaltas,
      resumoMensalidades,
      membrosInadimplentes,
      proximoEncontro,
      encontroEmAndamento,
    ] = await Promise.all([
      getDesbravadoresPorClasseUnidade(unidadeInfo.unidadeId),
      getEstatisticasPresencaUnidade(unidadeInfo.unidadeId),
      getMembrosComMaisFaltas(unidadeInfo.unidadeId),
      getResumoMensalidadesUnidade(unidadeInfo.unidadeId, mesAtual, anoAtual),
      getMembrosInadimplentesUnidade(unidadeInfo.unidadeId),
      getProximoEncontro(),
      getEncontroEmAndamento(),
    ]);
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
  }

  const totalDesbravadores = resumoMensalidades.desbravadores.total;
  const totalConselheiros = resumoMensalidades.conselheiros.total;
  const totalMembros = resumoMensalidades.totalMembros;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Dashboard - Conselheiro
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Visao geral da sua unidade
        </p>
      </div>

      {/* Row 1: Unit + Members + Encontro cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">
                  Minha Unidade
                </p>
                <p
                  className="text-sm sm:text-lg font-bold truncate"
                  style={{ color: "var(--unit-primary)" }}
                >
                  {unidadeInfo.unidadeNome}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Desbravadores
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {totalDesbravadores}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Conselheiros
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {totalConselheiros}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">
                  Proximo Encontro
                </p>
                <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                  {proximoEncontro
                    ? formatDate(proximoEncontro.data)
                    : "Nenhum"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  encontroEmAndamento ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <ClipboardList
                  className={`h-5 w-5 ${
                    encontroEmAndamento ? "text-green-600" : "text-gray-400"
                  }`}
                />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Chamada</p>
                {encontroEmAndamento ? (
                  <Badge variant="warning">Pendente</Badge>
                ) : (
                  <p className="text-sm font-medium text-gray-400">
                    Sem encontro
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert: Encontro em andamento */}
      {encontroEmAndamento && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-green-800">
                Encontro em andamento!
              </p>
              <p className="text-sm text-green-700">
                {formatDate(encontroEmAndamento.data)}
                {encontroEmAndamento.descricao &&
                  ` - ${encontroEmAndamento.descricao}`}
              </p>
            </div>
            <Link href={`/conselheiro/chamada/${encontroEmAndamento.id}`}>
              <Button size="sm" className="w-full sm:w-auto">
                <ClipboardList className="h-4 w-4 mr-2" />
                Fazer Chamada
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Row 2: Class breakdown */}
      {classesPorUnidade.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Membros por Classe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {classesPorUnidade.map((classe) => (
                <div
                  key={classe.classeNome}
                  className="bg-gray-50 rounded-lg p-3 text-center"
                >
                  <p className="text-sm text-gray-600">{classe.classeNome}</p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{ color: "var(--unit-primary)" }}
                  >
                    {classe.quantidade}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Row 3: Presence stats (last 3 months) */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Presenca - Ultimos 3 Meses ({estatisticasPresenca.totalEncontros}{" "}
          encontros)
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Taxa de Presenca
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-bold ${getPercentageColor(
                      estatisticasPresenca.taxaPresenca
                    )}`}
                  >
                    {estatisticasPresenca.taxaPresenca}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Pontualidade
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-bold ${getPercentageColor(
                      estatisticasPresenca.taxaPontualidade
                    )}`}
                  >
                    {estatisticasPresenca.taxaPontualidade}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Com Material
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-bold ${getPercentageColor(
                      estatisticasPresenca.taxaMaterial
                    )}`}
                  >
                    {estatisticasPresenca.taxaMaterial}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shirt className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Com Uniforme
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-bold ${getPercentageColor(
                      estatisticasPresenca.taxaUniforme
                    )}`}
                  >
                    {estatisticasPresenca.taxaUniforme}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 4: Financial - Desbravadores */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Mensalidades - Desbravadores
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Em Dia</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {resumoMensalidades.desbravadores.emDia}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Pendentes</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {resumoMensalidades.desbravadores.pendentes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Isentos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-500">
                    {resumoMensalidades.desbravadores.isentos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Total
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {resumoMensalidades.desbravadores.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 5: Financial - Conselheiros */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Mensalidades - Conselheiros
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Em Dia</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {resumoMensalidades.conselheiros.emDia}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Pendentes</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {resumoMensalidades.conselheiros.pendentes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Isentos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-500">
                    {resumoMensalidades.conselheiros.isentos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Total
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {resumoMensalidades.conselheiros.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Atalhos Rapidos
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/conselheiro/minha-unidade">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--unit-primary)" }}
                  >
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Membros</p>
                    <p className="text-sm text-gray-500">Ver minha unidade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/conselheiro/minha-unidade/historico">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Historico</p>
                    <p className="text-sm text-gray-500">Ver presencas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/conselheiro/encontros">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Encontros</p>
                    <p className="text-sm text-gray-500">Ver encontros</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/conselheiro/mensalidades">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mensalidades</p>
                    <p className="text-sm text-gray-500">Ver pagamentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Quick Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Members with most absences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Membros com Mais Faltas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membrosComFaltas.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nenhuma falta registrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {membrosComFaltas.map((membro) => (
                  <div
                    key={membro.membroId}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-red-700">
                          {membro.totalFaltas}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {membro.membroNome}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {membro.totalFaltas} falta
                      {membro.totalFaltas !== 1 ? "s" : ""} em{" "}
                      {membro.totalEncontros} encontro
                      {membro.totalEncontros !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members with pending mensalidades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-500" />
              Mensalidades Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membrosInadimplentes.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <DollarSign className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Todos em dia!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {membrosInadimplentes.map((membro) => (
                  <div
                    key={membro.membroId}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-amber-700">
                          {membro.mesesPendentes.length}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {membro.membroNome}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {membro.mesesPendentes.map((mes) => (
                        <Badge
                          key={mes}
                          variant="outline"
                          className="text-xs text-red-600 border-red-200"
                        >
                          {mes}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
