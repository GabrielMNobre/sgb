"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { EncontroModal } from "@/components/forms/encontro-modal";
import type { Encontro, EncontroFormData } from "@/types/encontro";
import { atualizarEncontroAction } from "../../actions";

export default function EditarEncontroPage() {
  const router = useRouter();
  const params = useParams();
  const encontroId = params.encontroId as string;

  const [encontro, setEncontro] = useState<Encontro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await fetch(`/api/encontros/${encontroId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "finalizado") {
            router.push(`/admin/encontros/${encontroId}`);
            return;
          }
          setEncontro(data);
        }
      } catch (err) {
        console.error("Erro ao carregar encontro:", err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [encontroId, router]);

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/encontros/${encontroId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Editar Encontro</h1>
      </div>

      <EncontroModal
        isOpen={true}
        onClose={() => router.push(`/admin/encontros/${encontroId}`)}
        encontroInicial={{
          id: encontro.id,
          data: encontro.data?.split("T")[0] || encontro.data,
          descricao: encontro.descricao,
        }}
        onSubmit={async (data: EncontroFormData, id?: string) => {
          if (id) {
            const result = await atualizarEncontroAction(id, data);
            if (result.success) {
              router.push(`/admin/encontros/${encontroId}`);
            }
            return result;
          }
        }}
      />
    </div>
  );
}
