import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Calendar, ClipboardList, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getUnidadeDoConselheiro } from "@/services/conselheiros";
import { getProximoEncontro, getEncontroEmAndamento } from "@/services/encontros";
import { formatDate } from "@/lib/utils/date";

export default async function ConselheiroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const unidadeInfo = await getUnidadeDoConselheiro(user.id);

  let totalMembros = 0;
  if (unidadeInfo) {
    const { count } = await supabase
      .from("membros")
      .select("*", { count: "exact", head: true })
      .eq("unidade_id", unidadeInfo.unidadeId)
      .eq("ativo", true);
    totalMembros = count || 0;
  }

  const [proximoEncontro, encontroEmAndamento] = await Promise.all([
    getProximoEncontro(),
    getEncontroEmAndamento(),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Dashboard - Conselheiro
        </h1>
        <p className="text-sm sm:text-base text-gray-500">Visão geral da sua unidade</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Minha Unidade</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                  {unidadeInfo?.unidadeNome || "Não vinculado"}
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
                <p className="text-xs sm:text-sm text-gray-500">Membros</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {unidadeInfo ? totalMembros : "--"}
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
                <p className="text-xs sm:text-sm text-gray-500">Próximo Encontro</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                  {proximoEncontro ? formatDate(proximoEncontro.data) : "Nenhum"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                encontroEmAndamento ? "bg-green-100" : "bg-gray-100"
              }`}>
                <ClipboardList className={`h-5 w-5 ${
                  encontroEmAndamento ? "text-green-600" : "text-gray-400"
                }`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Chamada</p>
                {encontroEmAndamento ? (
                  <Badge variant="warning">Pendente</Badge>
                ) : (
                  <p className="text-sm font-medium text-gray-400">Sem encontro</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {encontroEmAndamento && unidadeInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-green-800">
                Encontro em andamento!
              </p>
              <p className="text-sm text-green-700">
                {formatDate(encontroEmAndamento.data)}
                {encontroEmAndamento.descricao && ` - ${encontroEmAndamento.descricao}`}
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

      {!unidadeInfo && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">Você não está vinculado a nenhuma unidade</p>
              <p className="text-sm text-gray-400">
                Entre em contato com a secretaria para ser vinculado a uma unidade
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Atalhos Rápidos
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/conselheiro/minha-unidade">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Minha Unidade</p>
                    <p className="text-sm text-gray-500">Ver membros</p>
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

          <Link href="/conselheiro/chamada">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Chamada</p>
                    <p className="text-sm text-gray-500">Fazer chamada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
