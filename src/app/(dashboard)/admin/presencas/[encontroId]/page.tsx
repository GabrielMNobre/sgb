"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ClipboardList, CheckCircle2, UserCog } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import type { Encontro, ResumoPresencaUnidade, ResumoDiretoria } from "@/types/encontro";

export default function PresencasGridPage() {
  const params = useParams();
  const encontroId = params.encontroId as string;

  const [encontro, setEncontro] = useState<Encontro | null>(null);
  const [unidades, setUnidades] = useState<ResumoPresencaUnidade[]>([]);
  const [diretoria, setDiretoria] = useState<ResumoDiretoria | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [encontroRes, resumoRes] = await Promise.all([
          fetch(`/api/encontros/${encontroId}`),
          fetch(`/api/encontros/${encontroId}/resumo`),
        ]);

        if (encontroRes.ok) setEncontro(await encontroRes.json());
        if (resumoRes.ok) {
          const data = await resumoRes.json();
          setUnidades(data.unidades);
          setDiretoria(data.diretoria);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [encontroId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loading size="lg" />
        <p className="text-gray-500 mt-3">Carregando...</p>
      </div>
    );
  }

  if (!encontro) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Encontro não encontrado</p>
      </div>
    );
  }

  const editavel = encontro.status === "em_andamento";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Presenças - {formatDate(encontro.data)}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Selecione uma unidade para registrar presenças
        </p>
      </div>

      {!editavel && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            {encontro.status === "agendado"
              ? "Este encontro ainda não foi iniciado. Inicie o encontro para liberar as presenças."
              : "Este encontro já foi finalizado. Presenças apenas para visualização."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card Diretoria */}
        {diretoria && diretoria.totalMembros > 0 && (
          <Link href={`/admin/presencas/${encontroId}/diretoria`}>
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-purple-600">
                      <UserCog className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Diretoria</p>
                      <p className="text-sm text-gray-500">{diretoria.totalMembros} membros</p>
                    </div>
                  </div>
                  {diretoria.chamadaRealizada && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Presentes</span>
                    <span className="font-medium">
                      {diretoria.totalPresentes}/{diretoria.totalMembros}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${diretoria.percentualPresenca}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {diretoria.percentualPresenca}%
                    </span>
                    {diretoria.chamadaRealizada ? (
                      <Badge variant="success">Realizada</Badge>
                    ) : (
                      <Badge variant="default">Pendente</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Cards de Unidades */}
        {unidades.map((u) => (
          <Link key={u.unidadeId} href={`/admin/presencas/${encontroId}/${u.unidadeId}`}>
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: u.corPrimaria }}
                    >
                      <span className="text-sm font-bold" style={{ color: u.corSecundaria }}>
                        {u.unidadeNome.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.unidadeNome}</p>
                      <p className="text-sm text-gray-500">{u.totalMembros} membros</p>
                    </div>
                  </div>
                  {u.chamadaRealizada && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Presentes</span>
                    <span className="font-medium">
                      {u.totalPresentes}/{u.totalMembros}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${u.percentualPresenca}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {u.percentualPresenca}%
                    </span>
                    {u.chamadaRealizada ? (
                      <Badge variant="success">Realizada</Badge>
                    ) : (
                      <Badge variant="default">Pendente</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {unidades.length === 0 && (!diretoria || diretoria.totalMembros === 0) && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma unidade ativa encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
