import Link from "next/link";
import { Users, Building2, UserPlus, Link2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { countUnidadesAtivas } from "@/services/unidades";
import {
  countMembrosAtivos,
  countDesbravadoresAtivos,
  countDiretoriaAtivos,
  getMembrosRecentes,
} from "@/services/membros";

export default async function SecretariaPage() {
  const [totalUnidades, totalMembros, totalDesbravadores, totalDiretoria, membrosRecentes] =
    await Promise.all([
      countUnidadesAtivas(),
      countMembrosAtivos(),
      countDesbravadoresAtivos(),
      countDiretoriaAtivos(),
      getMembrosRecentes(5),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard - Secretaria</h1>
        <p className="text-gray-500">Visão geral dos cadastros do clube</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/secretaria/unidades/nova">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nova Unidade</p>
                  <p className="text-sm text-gray-500">Criar uma nova unidade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/secretaria/membros/novo">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Novo Membro</p>
                  <p className="text-sm text-gray-500">Cadastrar um novo membro</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/secretaria/conselheiros">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Gerenciar Conselheiros</p>
                  <p className="text-sm text-gray-500">Vincular às unidades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Membros recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Membros Recentes</CardTitle>
            <Link href="/secretaria/membros">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {membrosRecentes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum membro cadastrado ainda
            </p>
          ) : (
            <div className="space-y-4">
              {membrosRecentes.map((membro) => (
                <div
                  key={membro.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{membro.nome}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            membro.tipo === "desbravador" ? "default" : "outline"
                          }
                          className="text-xs"
                        >
                          {membro.tipo === "desbravador"
                            ? "Desbravador"
                            : "Diretoria"}
                        </Badge>
                        {membro.unidade && (
                          <span className="text-xs text-gray-500">
                            {membro.unidade.nome}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link href={`/secretaria/membros/${membro.id}`}>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
