"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  BookOpen,
  BarChart3,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import { PRESENCE_LABELS } from "@/lib/constants";
import type { MembroDetalhesConselheiro } from "@/services/conselheiro-dashboard";

function calcularIdade(dataNascimento?: string): string {
  if (!dataNascimento) return "\u2014";
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return `${idade} anos`;
}

function statusVariant(
  status: string
): "success" | "warning" | "error" | "secondary" {
  switch (status) {
    case "pontual":
      return "success";
    case "atrasado":
      return "warning";
    case "falta":
      return "error";
    case "falta_justificada":
      return "secondary";
    default:
      return "secondary";
  }
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gray-400" />
      <span className="text-sm text-gray-500">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function MembroDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const membroId = params.membroId as string;

  const [membro, setMembro] = useState<MembroDetalhesConselheiro | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const res = await fetch(`/api/conselheiro/membros/${membroId}`);
        if (res.ok) {
          setMembro(await res.json());
        } else {
          const data = await res.json().catch(() => ({}));
          setErro(data.error || "Erro ao carregar membro");
        }
      } catch (err) {
        console.error("Erro ao carregar membro:", err);
        setErro("Erro ao carregar dados do membro");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [membroId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loading size="lg" />
        <p className="text-gray-500 mt-3">Carregando...</p>
      </div>
    );
  }

  if (erro || !membro) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push("/conselheiro/minha-unidade/membros")
          }
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {erro || "Membro não encontrado"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push("/conselheiro/minha-unidade/membros")
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{membro.nome}</h1>
          <p className="text-sm text-gray-500">
            {membro.classe?.nome || "Sem classe"}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={Calendar}
              label="Data de Nascimento"
              value={formatDate(membro.dataNascimento)}
            />
            <InfoRow
              icon={User}
              label="Idade"
              value={calcularIdade(membro.dataNascimento)}
            />
            <InfoRow
              icon={Phone}
              label="Telefone"
              value={membro.telefone || "\u2014"}
            />
            <InfoRow
              icon={User}
              label="Responsável"
              value={membro.responsavel || "\u2014"}
            />
            {membro.telefoneResponsavel && (
              <InfoRow
                icon={Phone}
                label="Tel. Responsável"
                value={membro.telefoneResponsavel}
              />
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Mensalidade:</span>
              <Badge
                variant={
                  membro.statusMensalidade === "em_dia"
                    ? "success"
                    : membro.statusMensalidade === "isento"
                      ? "secondary"
                      : "error"
                }
              >
                {membro.statusMensalidade === "em_dia"
                  ? "Em Dia"
                  : membro.statusMensalidade === "isento"
                    ? "Isento"
                    : "Pendente"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Presença</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {membro.estatisticas.taxaPresenca}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Pontualidade</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {membro.estatisticas.taxaPontualidade}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Material</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">
              {membro.estatisticas.taxaMaterial}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Uniforme</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {membro.estatisticas.taxaUniforme}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two columns: Classes History + Recent Presences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Histórico de Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Histórico de Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membro.historicoClasses.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum registro</p>
            ) : (
              <div className="space-y-2">
                {membro.historicoClasses.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 border-b last:border-0"
                  >
                    <span className="text-sm font-medium">
                      {h.classeNome}
                    </span>
                    <Badge variant="outline">{h.ano}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimas Presenças */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Últimas Presenças
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membro.ultimasPresencas.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum registro</p>
            ) : (
              <div className="space-y-2">
                {membro.ultimasPresencas.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 border-b last:border-0"
                  >
                    <span className="text-sm text-gray-600">
                      {formatDate(p.data)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={statusVariant(p.status)}
                        className="text-xs"
                      >
                        {PRESENCE_LABELS[p.status] || p.status}
                      </Badge>
                      {p.temMaterial ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-gray-300" />
                      )}
                      {p.temUniforme ? (
                        <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-gray-300" />
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Material
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                    Uniforme
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
