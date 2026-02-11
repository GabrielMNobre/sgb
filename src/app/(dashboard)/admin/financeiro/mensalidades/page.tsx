import { getMensalidades } from "@/services/mensalidades";
import { getUnidadesAtivas } from "@/services/unidades";
import { MensalidadesControl } from "@/components/financial/mensalidades-control";
import {
  gerarMensalidadesDoMesAction,
  registrarPagamentosAction,
  estornarPagamentoAction,
} from "../actions";

export default async function MensalidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>;
}) {
  const hoje = new Date();
  const params = await searchParams;
  const mes = params.mes ? parseInt(params.mes) : hoje.getMonth() + 1;
  const ano = params.ano ? parseInt(params.ano) : hoje.getFullYear();

  const [mensalidades, unidades] = await Promise.all([
    getMensalidades({ mes, ano }),
    getUnidadesAtivas(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Controle de Mensalidades
          </h1>
          <p className="text-gray-500">Gerenciamento de pagamentos mensais</p>
        </div>
      </div>

      <MensalidadesControl
        initialMensalidades={mensalidades}
        unidades={unidades}
        basePath="/admin/financeiro/mensalidades"
        initialMes={mes}
        initialAno={ano}
        onGerar={gerarMensalidadesDoMesAction}
        onRegistrarPagamento={registrarPagamentosAction}
        onEstornarPagamento={estornarPagamentoAction}
      />
    </div>
  );
}
