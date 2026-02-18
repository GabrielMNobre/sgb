"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Play,
  CheckCheck,
  ClipboardList,
  Users,
  Clock,
  AlertTriangle,
  BookOpen,
  Shirt,
  UserCog,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EncontroModal } from "@/components/forms/encontro-modal";
import { formatDate } from "@/lib/utils/date";
import { useToast } from "@/components/ui/toast";
import type {
  Encontro,
  EncontroFormData,
  ResumoPresencaEncontro,
  ResumoPresencaUnidade,
  ResumoDiretoria,
  StatusEncontro,
} from "@/types/encontro";
import {
  atualizarEncontroAction,
  iniciarEncontroAction,
  finalizarEncontroAction,
} from "../actions";

const statusConfig: Record<
  StatusEncontro,
  { label: string; variant: "default" | "warning" | "success" }
> = {
  agendado: { label: "Agendado", variant: "default" },
  em_andamento: { label: "Em Andamento", variant: "warning" },
  finalizado: { label: "Finalizado", variant: "success" },
};

export default function EncontroDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const encontroId = params.encontroId as string;
  const { success, error: toastError } = useToast();

  const [encontro, setEncontro] = useState<Encontro | null>(null);
  const [resumo, setResumo] = useState<ResumoPresencaEncontro | null>(null);
  const [unidades, setUnidades] = useState<ResumoPresencaUnidade[]>([]);
  const [diretoria, setDiretoria] = useState<ResumoDiretoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [startDialog, setStartDialog] = useState(false);
  const [finishDialog, setFinishDialog] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [encontroId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [encontroRes, resumoRes] = await Promise.all([
        fetch(`/api/encontros/${encontroId}`),
        fetch(`/api/encontros/${encontroId}/resumo`),
      ]);

      if (encontroRes.ok) {
        setEncontro(await encontroRes.json());
      }
      if (resumoRes.ok) {
        const data = await resumoRes.json();
        setResumo(data.resumo);
        setUnidades(data.unidades);
        setDiretoria(data.diretoria);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = async (data: EncontroFormData, id?: string) => {
    if (id) {
      const result = await atualizarEncontroAction(id, data);
      await carregarDados();
      return result;
    }
  };

  const confirmarIniciar = async () => {
    const result = await iniciarEncontroAction(encontroId);
    if (result.success) {
      success("Encontro iniciado - chamada liberada");
    } else {
      toastError(result.error || "Erro ao iniciar encontro");
    }
    await carregarDados();
    setStartDialog(false);
  };

  const confirmarFinalizar = async () => {
    const result = await finalizarEncontroAction(encontroId);
    if (result.success) {
      success("Encontro finalizado com sucesso");
    } else {
      toastError(result.error || "Erro ao finalizar encontro");
    }
    await carregarDados();
    setFinishDialog(false);
  };

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
        <Button variant="ghost" onClick={() => router.push("/admin/encontros")} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const config = statusConfig[encontro.status];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/encontros")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Encontro - {formatDate(encontro.data)}
              </h1>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            {encontro.descricao && (
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                {encontro.descricao}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {encontro.status !== "finalizado" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
          {encontro.status === "agendado" && (
            <Button
              size="sm"
              onClick={() => setStartDialog(true)}
              className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Iniciar
            </Button>
          )}
          {encontro.status === "em_andamento" && (
            <>
              <Link href={`/admin/encontros/${encontroId}/chamada`} className="flex-1 sm:flex-none">
                <Button size="sm" className="w-full">
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Chamada
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFinishDialog(true)}
                className="flex-1 sm:flex-none"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Finalizar
              </Button>
            </>
          )}
          {encontro.status === "finalizado" && (
            <Link href={`/admin/encontros/${encontroId}/chamada`} className="flex-1 sm:flex-none">
              <Button variant="outline" size="sm" className="w-full">
                <ClipboardList className="h-4 w-4 mr-1" />
                Ver Chamada
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Resumo de Presenças */}
      {encontro.status !== "agendado" && resumo && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Resumo de Presenças
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Total Membros</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{resumo.totalMembros}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <CheckCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Pontuais</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{resumo.totalPontuais}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Atrasados</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-600">{resumo.totalAtrasados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Faltas</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{resumo.totalFaltas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Justificadas</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-600">{resumo.totalFaltasJustificadas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Presentes</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{resumo.totalPresentes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Com Material</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">{resumo.totalComMaterial}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <Shirt className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Com Uniforme</p>
                    <p className="text-xl sm:text-2xl font-bold text-indigo-600">{resumo.totalComUniforme}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Presenças por Unidade */}
      {encontro.status !== "agendado" && (unidades.length > 0 || (diretoria && diretoria.totalMembros > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Presenças por Unidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Diretoria */}
              {diretoria && diretoria.totalMembros > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-purple-200 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-600">
                      <UserCog className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Diretoria</p>
                      <p className="text-sm text-gray-500">
                        {diretoria.totalPresentes}/{diretoria.totalMembros} presentes
                        {diretoria.chamadaRealizada && (
                          <span className="text-green-600 ml-2">• Chamada realizada</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-11 sm:ml-0">
                    <div className="flex-1 sm:w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${diretoria.percentualPresenca}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {diretoria.percentualPresenca}%
                    </span>
                    <Link href={`/admin/encontros/${encontroId}/chamada/diretoria`}>
                      <Button variant="outline" size="sm">
                        <ClipboardList className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Chamada</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Unidades */}
              {unidades.map((u) => (
                <div
                  key={u.unidadeId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: u.corPrimaria }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: u.corSecundaria }}
                      >
                        {u.unidadeNome.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.unidadeNome}</p>
                      <p className="text-sm text-gray-500">
                        {u.totalPresentes}/{u.totalMembros} presentes
                        {u.chamadaRealizada && (
                          <span className="text-green-600 ml-2">• Chamada realizada</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-11 sm:ml-0">
                    <div className="flex-1 sm:w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${u.percentualPresenca}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {u.percentualPresenca}%
                    </span>
                    <Link href={`/admin/encontros/${encontroId}/chamada/${u.unidadeId}`}>
                      <Button variant="outline" size="sm">
                        <ClipboardList className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Chamada</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <EncontroModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        encontroInicial={{
          id: encontro.id,
          data: encontro.data?.split("T")[0] || encontro.data,
          descricao: encontro.descricao,
        }}
        onSubmit={handleEditar}
      />

      <ConfirmDialog
        isOpen={startDialog}
        onClose={() => setStartDialog(false)}
        onConfirm={confirmarIniciar}
        title="Iniciar Encontro"
        message="Ao iniciar o encontro, a chamada será liberada para os conselheiros. Deseja continuar?"
        confirmText="Iniciar"
        variant="warning"
      />

      <ConfirmDialog
        isOpen={finishDialog}
        onClose={() => setFinishDialog(false)}
        onConfirm={confirmarFinalizar}
        title="Finalizar Encontro"
        message="Ao finalizar o encontro, a chamada será encerrada e não poderá mais ser editada. Deseja continuar?"
        confirmText="Finalizar"
        variant="warning"
      />
    </div>
  );
}
