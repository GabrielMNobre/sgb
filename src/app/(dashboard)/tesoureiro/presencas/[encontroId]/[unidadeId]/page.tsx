"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChamadaRapidaForm } from "@/components/forms/chamada-rapida-form";
import { formatDate } from "@/lib/utils/date";
import type { Encontro, PresencaComMembro } from "@/types/encontro";
import { salvarPresencaAction } from "../../actions";

export default function PresencasUnidadePage() {
  const router = useRouter();
  const params = useParams();
  const encontroId = params.encontroId as string;
  const unidadeId = params.unidadeId as string;

  const [encontro, setEncontro] = useState<Encontro | null>(null);
  const [membros, setMembros] = useState<PresencaComMembro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [encontroRes, presencasRes] = await Promise.all([
          fetch(`/api/encontros/${encontroId}`),
          fetch(`/api/encontros/${encontroId}/presencas?unidadeId=${unidadeId}`),
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
  }, [encontroId, unidadeId]);

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
  const unidadeNome = membros[0]?.membro?.unidade?.nome || "Unidade";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/tesoureiro/presencas/${encontroId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Presenças - {unidadeNome}
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
              return await salvarPresencaAction(encontroId, presencas);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
