import { createClient } from "@/lib/supabase/server";
import { snakeToCamel } from "@/lib/utils/case-converter";
import type {
  PagamentoAcampamento,
  PagamentoComParticipante,
  PagamentoFormData,
  FiltrosPagamento,
} from "@/types/acampamento";

// ========== CRUD Pagamentos Acampamento ==========

export async function getPagamentos(
  acampamentoId: string,
  filtros?: FiltrosPagamento
): Promise<PagamentoComParticipante[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // First get all participant IDs for this acampamento
  const { data: participantes, error: participantesError } = await db
    .from("participantes_acampamento")
    .select("id")
    .eq("acampamento_id", acampamentoId);

  if (participantesError) {
    console.error("Erro ao buscar participantes do acampamento:", participantesError);
    throw new Error("Erro ao buscar participantes do acampamento");
  }

  const participanteIds = (participantes || []).map((p: any) => p.id);

  if (participanteIds.length === 0) {
    return [];
  }

  // Query pagamentos with nested participante→membro
  let query = db
    .from("pagamentos_acampamento")
    .select(`
      *,
      participantes_acampamento (
        id,
        membros (
          id,
          nome
        )
      )
    `)
    .in("participante_id", participanteIds);

  // Apply filters
  if (filtros?.dataInicio) {
    query = query.gte("data", filtros.dataInicio);
  }

  if (filtros?.dataFim) {
    query = query.lte("data", filtros.dataFim);
  }

  if (filtros?.participanteId) {
    query = query.eq("participante_id", filtros.participanteId);
  }

  query = query
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar pagamentos:", error);
    throw new Error("Erro ao buscar pagamentos");
  }

  return (data || []).map((raw: any) => {
    const { participantes_acampamento, ...paymentData } = raw;
    return {
      ...snakeToCamel<PagamentoAcampamento>(paymentData),
      participante: {
        id: participantes_acampamento?.id,
        membro: participantes_acampamento?.membros
          ? {
              id: participantes_acampamento.membros.id,
              nome: participantes_acampamento.membros.nome,
            }
          : undefined,
      },
    };
  });
}

export async function getPagamentosByParticipante(
  participanteId: string
): Promise<PagamentoAcampamento[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pagamentos_acampamento")
    .select("*")
    .eq("participante_id", participanteId)
    .order("data", { ascending: false });

  if (error) {
    console.error("Erro ao buscar pagamentos do participante:", error);
    throw new Error("Erro ao buscar pagamentos do participante");
  }

  return (data || []).map((item: any) => snakeToCamel<PagamentoAcampamento>(item));
}

export async function createPagamento(
  formData: PagamentoFormData,
  usuarioId: string
): Promise<PagamentoAcampamento> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToInsert = {
    participante_id: formData.participanteId,
    data: formData.data,
    valor: formData.valor,
    observacao: formData.observacao || null,
    registrado_por: usuarioId,
  };

  const { data, error } = await db
    .from("pagamentos_acampamento")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar pagamento:", error);
    throw new Error("Erro ao criar pagamento");
  }

  return snakeToCamel<PagamentoAcampamento>(data);
}

export async function deletePagamento(id: string): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("pagamentos_acampamento")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir pagamento:", error);
    throw new Error("Erro ao excluir pagamento");
  }
}

// ========== Calculos e Totalizacoes ==========

export async function calcularTotalPagamentos(
  participanteId: string
): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pagamentos_acampamento")
    .select("valor")
    .eq("participante_id", participanteId);

  if (error) {
    console.error("Erro ao calcular total de pagamentos:", error);
    throw new Error("Erro ao calcular total de pagamentos");
  }

  return (data || []).reduce((sum: number, item: any) => sum + (item.valor || 0), 0);
}

export async function getUltimosPagamentos(
  acampamentoId: string,
  limite: number = 5
): Promise<PagamentoComParticipante[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // First get participant IDs for this acampamento
  const { data: participantes, error: participantesError } = await db
    .from("participantes_acampamento")
    .select("id")
    .eq("acampamento_id", acampamentoId);

  if (participantesError) {
    console.error("Erro ao buscar participantes do acampamento:", participantesError);
    throw new Error("Erro ao buscar participantes do acampamento");
  }

  const participanteIds = (participantes || []).map((p: any) => p.id);

  if (participanteIds.length === 0) {
    return [];
  }

  const { data, error } = await db
    .from("pagamentos_acampamento")
    .select(`
      *,
      participantes_acampamento (
        id,
        membros (
          id,
          nome
        )
      )
    `)
    .in("participante_id", participanteIds)
    .order("data", { ascending: false })
    .limit(limite);

  if (error) {
    console.error("Erro ao buscar últimos pagamentos:", error);
    throw new Error("Erro ao buscar últimos pagamentos");
  }

  return (data || []).map((raw: any) => {
    const { participantes_acampamento, ...paymentData } = raw;
    return {
      ...snakeToCamel<PagamentoAcampamento>(paymentData),
      participante: {
        id: participantes_acampamento?.id,
        membro: participantes_acampamento?.membros
          ? {
              id: participantes_acampamento.membros.id,
              nome: participantes_acampamento.membros.nome,
            }
          : undefined,
      },
    };
  });
}
