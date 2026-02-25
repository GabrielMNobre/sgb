"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, UserCog } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChamadaRapidaForm } from "@/components/forms/chamada-rapida-form";
import { formatDate } from "@/lib/utils/date";
import type { Encontro, PresencaComMembro } from "@/types/encontro";
import { salvarChamadaAction } from "../../../encontros/actions";

export default function PresencasDiretoriaPage() {
  const router = useRouter();
  const params = useParams();
  const encontroId = params.encontroId as string;

  const [encontro, setEncontro] = useState<Encontro | null>(null);
  const [membros, setMembros] = useState<PresencaComMembro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [encontroRes, presencasRes] = await Promise.all([
          fetch(`/api/encontros/${encontroId}`),
          fetch(`/api/encontros/${encontroId}/presencas?tipo=diretoria`),
        ]);

        if (encontroRes.ok) setEncontro(await encontroRes.json());
        if (presencasRes.ok) setMembros(await presencasRes.json());
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
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/presencas/${encontroId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <UserCog className="h-5 w-5 text-purple-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Presenças - Diretoria
            </h1>
            <Badge variant={editavel ? "warning" : "success"}>
              {editavel ? "Em Andamento" : encontro.status === "agendado" ? "Agendado" : "Finalizado"}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-gray-500">
            {formatDate(encontro.data)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros ({membros.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ChamadaRapidaForm
            encontroId={encontroId}
            membrosComPresenca={membros}
            editavel={editavel}
            onSave={async (presencas) => {
              return await salvarChamadaAction(encontroId, presencas);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
