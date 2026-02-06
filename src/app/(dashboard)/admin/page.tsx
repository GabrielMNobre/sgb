import Link from "next/link";
import {
  Users,
  Building2,
  Award,
  UserCog,
  Package,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { countUnidadesAtivas, getUnidadesComContagem } from "@/services/unidades";
import {
  countMembrosAtivos,
  countDesbravadoresAtivos,
  countDiretoriaAtivos,
  getDesbravadoresPorClasse,
} from "@/services/membros";
import { countConselheirosAtivos } from "@/services/conselheiros";
import { countEspecialidadesAtivas } from "@/services/especialidades";
import { countConquistasPendentes } from "@/services/membros-especialidades";

export default async function AdminPage() {
  const [
    totalMembros,
    totalDesbravadores,
    totalDiretoria,
    totalConselheiros,
    totalUnidades,
    totalEspecialidades,
    conquistasPendentes,
    unidadesComContagem,
    desbravadoresPorClasse,
  ] = await Promise.all([
    countMembrosAtivos(),
    countDesbravadoresAtivos(),
    countDiretoriaAtivos(),
    countConselheirosAtivos(),
    countUnidadesAtivas(),
    countEspecialidadesAtivas(),
    countConquistasPendentes(),
    getUnidadesComContagem(),
    getDesbravadoresPorClasse(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard - Administrador</h1>
        <p className="text-gray-500">Visão consolidada do clube</p>
      </div>

      {/* Linha 1 - Membros */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Membros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Membros Ativos</p>
                  <p className="text-3xl font-bold text-primary">{totalMembros}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Desbravadores</p>
                  <p className="text-3xl font-bold text-blue-600">{totalDesbravadores}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Diretoria</p>
                  <p className="text-3xl font-bold text-green-600">{totalDiretoria}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Conselheiros</p>
                  <p className="text-3xl font-bold text-purple-600">{totalConselheiros}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserCog className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Linha 2 - Estrutura */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Estrutura
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Unidades Ativas</p>
                  <p className="text-3xl font-bold text-primary">{totalUnidades}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Especialidades</p>
                  <p className="text-3xl font-bold text-amber-600">{totalEspecialidades}</p>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Entregas Pendentes</p>
                  <p className="text-3xl font-bold text-orange-600">{conquistasPendentes}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seções do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Encontros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Encontros
              </CardTitle>
              <Link href="/admin/encontros">
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum encontro agendado</p>
              <Link href="/admin/encontros">
                <Button variant="outline" size="sm" className="mt-4">
                  Agendar Encontro
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Unidades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Unidades
              </CardTitle>
              <Link href="/admin/unidades">
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {unidadesComContagem.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma unidade cadastrada</p>
                <Link href="/admin/unidades/nova">
                  <Button variant="outline" size="sm" className="mt-4">
                    Criar Unidade
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {unidadesComContagem.map((unidade) => (
                  <div
                    key={unidade.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: unidade.corPrimaria }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ color: unidade.corSecundaria }}
                        >
                          {unidade.nome.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{unidade.nome}</span>
                    </div>
                    <Badge variant="outline">{unidade.totalMembros} membros</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Desbravadores por Classe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Desbravadores por Classe
            </CardTitle>
          </CardHeader>
          <CardContent>
            {desbravadoresPorClasse.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum desbravador ativo com classe definida</p>
              </div>
            ) : (
              <div className="space-y-2">
                {desbravadoresPorClasse.map((item) => (
                  <div
                    key={item.classeId}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">{item.classeNome}</span>
                    <Badge variant="default">{item.quantidade}</Badge>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2 px-3 bg-primary/10 rounded-lg mt-3">
                  <span className="font-semibold text-primary">Total</span>
                  <Badge variant="default" className="bg-primary text-white">
                    {desbravadoresPorClasse.reduce((sum, item) => sum + item.quantidade, 0)}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Atalhos rápidos */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Atalhos Rápidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/membros/novo">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Novo Membro</p>
                    <p className="text-sm text-gray-500">Cadastrar membro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/unidades/nova">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Nova Unidade</p>
                    <p className="text-sm text-gray-500">Criar unidade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/especialidades/nova">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Nova Especialidade</p>
                    <p className="text-sm text-gray-500">Cadastrar especialidade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/conselheiros">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UserCog className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Conselheiros</p>
                    <p className="text-sm text-gray-500">Vincular às unidades</p>
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
