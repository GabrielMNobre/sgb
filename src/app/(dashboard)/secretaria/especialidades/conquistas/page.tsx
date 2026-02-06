import { getAllConquistas } from "@/services/membros-especialidades";
import { getUnidadesAtivas } from "@/services/unidades";
import { getEspecialidadesAtivas } from "@/services/especialidades";
import { getMembrosAtivos } from "@/services/membros";
import { Card } from "@/components/ui/card";
import { ConquistasManager } from "./conquistas-manager";

export default async function ConquistasPage() {
  const [conquistas, unidades, especialidades, membros] = await Promise.all([
    getAllConquistas().catch(() => []),
    getUnidadesAtivas(),
    getEspecialidadesAtivas(),
    getMembrosAtivos(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conquistas</h1>
        <p className="text-gray-500">Gerencie as especialidades conquistadas pelos membros</p>
      </div>

      <Card>
        <ConquistasManager
          conquistas={conquistas}
          unidades={unidades}
          especialidades={especialidades}
          membros={membros}
        />
      </Card>
    </div>
  );
}
