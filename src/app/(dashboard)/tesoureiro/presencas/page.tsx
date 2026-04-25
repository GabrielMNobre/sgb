"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";
import type { Encontro } from "@/types/encontro";

export default function PresencasRedirectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [semEncontro, setSemEncontro] = useState(false);

  useEffect(() => {
    const buscar = async () => {
      try {
        const res = await fetch("/api/encontros/em-andamento");
        if (res.ok) {
          const encontro: Encontro = await res.json();
          router.replace(`/tesoureiro/presencas/${encontro.id}`);
          return;
        }
        setSemEncontro(true);
      } catch {
        setSemEncontro(true);
      } finally {
        setLoading(false);
      }
    };
    buscar();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loading size="lg" />
        <p className="text-gray-500 mt-3">Buscando encontro ativo...</p>
      </div>
    );
  }

  if (semEncontro) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhum encontro em andamento"
        description="Inicie um encontro para registrar presenças."
      />
    );
  }

  return null;
}
