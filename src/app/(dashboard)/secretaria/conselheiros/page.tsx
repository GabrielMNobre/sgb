import Link from "next/link";
import { AlertTriangle, Users, Building2 } from "lucide-react";
import { getUnidadesComConselheiros, getConselheirosDisponiveis } from "@/services/conselheiros";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConselheirosManager } from "./conselheiros-manager";

export const dynamic = 'force-dynamic';

export default async function ConselheirosPage() {
  let unidades: Awaited<ReturnType<typeof getUnidadesComConselheiros>> = [];
  let conselheirosDisponiveis: Awaited<ReturnType<typeof getConselheirosDisponiveis>> = [];
  let error: string | null = null;

  try {
    [unidades, conselheirosDisponiveis] = await Promise.all([
      getUnidadesComConselheiros(),
      getConselheirosDisponiveis(),
    ]);
  } catch (err) {
    console.error("Erro ao carregar dados de conselheiros:", err);
    error = err instanceof Error ? err.message : "Erro ao carregar dados";
  }

  // Check prerequisites
  const hasUnidades = unidades.length > 0;
  const hasConselheiros = conselheirosDisponiveis.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vincular Conselheiros</h1>
        <p className="text-gray-500">Gerencie os conselheiros de cada unidade</p>
      </div>

      {error ? (
        <Card className="p-6">
          <EmptyState
            icon={AlertTriangle}
            title="Erro ao carregar dados"
            description={error}
            action={
              <Button onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            }
          />
        </Card>
      ) : !hasUnidades && !hasConselheiros ? (
        <Card className="p-6">
          <EmptyState
            icon={AlertTriangle}
            title="Configuração necessária"
            description="Para vincular conselheiros às unidades, é necessário ter unidades ativas e usuários com papel de conselheiro cadastrados."
          />
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/secretaria/unidades/nova">
              <Button variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Criar Unidade
              </Button>
            </Link>
            <Link href="/secretaria/membros/novo">
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Cadastrar Membro da Diretoria
              </Button>
            </Link>
          </div>
        </Card>
      ) : !hasUnidades ? (
        <Card className="p-6">
          <EmptyState
            icon={Building2}
            title="Nenhuma unidade ativa"
            description="Crie unidades primeiro para poder vincular conselheiros"
            action={
              <Link href="/secretaria/unidades/nova">
                <Button>
                  <Building2 className="h-4 w-4 mr-2" />
                  Criar Unidade
                </Button>
              </Link>
            }
          />
        </Card>
      ) : !hasConselheiros ? (
        <Card className="p-6">
          <EmptyState
            icon={Users}
            title="Nenhum conselheiro disponível"
            description="É necessário cadastrar usuários com o papel de conselheiro para vincular às unidades"
            action={
              <Link href="/secretaria/membros/novo">
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Cadastrar Membro
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <Card className="p-6">
          <ConselheirosManager
            unidades={unidades}
            conselheirosDisponiveis={conselheirosDisponiveis}
          />
        </Card>
      )}
    </div>
  );
}
