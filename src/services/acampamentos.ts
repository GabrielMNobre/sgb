import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type {
  Acampamento,
  AcampamentoFormData,
  FiltrosAcampamento,
  ResumoAcampamento,
} from "@/types/acampamento";
import { createEvento } from "@/services/eventos";
import { calcularTotalPorEvento } from "@/services/gastos";

// ========== CRUD Operations ==========

export async function getAcampamentos(
  filtros?: FiltrosAcampamento
): Promise<Acampamento[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("acampamentos")
    .select("*")
    .order("data_inicio", { ascending: false });

  if (filtros?.status) {
    query = query.eq("status", filtros.status);
  }

  if (filtros?.ano) {
    query = query
      .gte("data_inicio", `${filtros.ano}-01-01`)
      .lte("data_inicio", `${filtros.ano}-12-31`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar acampamentos:", error);
    throw new Error("Erro ao buscar acampamentos");
  }

  return data.map((acampamento: any) => snakeToCamel<Acampamento>(acampamento));
}

export async function getAcampamentoById(
  id: string
): Promise<Acampamento | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("acampamentos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Erro ao buscar acampamento:", error);
    throw new Error("Erro ao buscar acampamento");
  }

  return snakeToCamel<Acampamento>(data);
}

export async function createAcampamento(
  formData: AcampamentoFormData,
  usuarioId: string
): Promise<Acampamento> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Primeiro cria o evento vinculado
  const evento = await createEvento(
    { nome: formData.nome, ativo: true },
    usuarioId
  );

  const acampamentoData = {
    ...(camelToSnake(formData) as Record<string, unknown>),
    evento_id: evento.id,
    status: "aberto",
  };

  const { data, error } = await db
    .from("acampamentos")
    .insert(acampamentoData)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar acampamento:", error);
    throw new Error("Erro ao criar acampamento");
  }

  return snakeToCamel<Acampamento>(data);
}

export async function updateAcampamento(
  id: string,
  formData: Partial<AcampamentoFormData>
): Promise<Acampamento> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("acampamentos")
    .update(camelToSnake(formData))
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar acampamento:", error);
    throw new Error("Erro ao atualizar acampamento");
  }

  return snakeToCamel<Acampamento>(data);
}

export async function deleteAcampamento(id: string): Promise<void> {
  const supabase = await createClient();

  // Verificar se há participantes vinculados
  const { data: participantes } = await supabase
    .from("participantes_acampamento")
    .select("id")
    .eq("acampamento_id", id)
    .limit(1);

  if (participantes && participantes.length > 0) {
    throw new Error(
      "Não é possível excluir um acampamento com participantes"
    );
  }

  const { error } = await supabase
    .from("acampamentos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir acampamento:", error);
    throw new Error("Erro ao excluir acampamento");
  }
}

export async function finalizarAcampamento(
  id: string
): Promise<Acampamento> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("acampamentos")
    .update({ status: "finalizado" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao finalizar acampamento:", error);
    throw new Error("Erro ao finalizar acampamento");
  }

  return snakeToCamel<Acampamento>(data);
}

// ========== Cálculos e Totalizações ==========

export async function calcularResumo(
  acampamentoId: string
): Promise<ResumoAcampamento> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Buscar acampamento para obter evento_id
  const acampamento = await getAcampamentoById(acampamentoId);
  if (!acampamento) {
    throw new Error("Acampamento não encontrado");
  }

  // Buscar participantes inscritos
  const { data: participantes, error: participantesError } = await db
    .from("participantes_acampamento")
    .select("id, valor_a_pagar, isento, acampamento_id")
    .eq("acampamento_id", acampamentoId)
    .eq("status", "inscrito");

  if (participantesError) {
    console.error("Erro ao buscar participantes:", participantesError);
    throw new Error("Erro ao buscar participantes");
  }

  // Buscar participantes com dados do membro para calcular autorizações pendentes
  const { data: participantesComMembro, error: membrosError } = await db
    .from("participantes_acampamento")
    .select(`
      id,
      autorizacao_recolhida,
      membros (
        data_nascimento
      )
    `)
    .eq("acampamento_id", acampamentoId)
    .eq("status", "inscrito");

  if (membrosError) {
    console.error("Erro ao buscar participantes com membros:", membrosError);
    throw new Error("Erro ao buscar participantes com membros");
  }

  // Buscar pagamentos dos participantes inscritos
  const participanteIds = participantes.map((p: any) => p.id);

  let totalArrecadado = 0;
  if (participanteIds.length > 0) {
    const { data: pagamentos, error: pagamentosError } = await db
      .from("pagamentos_acampamento")
      .select("valor")
      .in("participante_id", participanteIds);

    if (pagamentosError) {
      console.error("Erro ao buscar pagamentos:", pagamentosError);
      throw new Error("Erro ao buscar pagamentos");
    }

    totalArrecadado = pagamentos.reduce(
      (sum: number, p: any) => sum + (p.valor || 0),
      0
    );
  }

  // Calcular total de gastos via evento
  const totalGastos = await calcularTotalPorEvento(acampamento.eventoId);

  // Calcular totais
  const totalParticipantes = participantes.length;
  const totalIsentos = participantes.filter((p: any) => p.isento).length;

  // Calcular autorizações pendentes (menores de 18 sem autorização recolhida)
  const hoje = new Date();
  const autorizacoesPendentes = participantesComMembro.filter((p: any) => {
    if (p.autorizacao_recolhida) return false;
    const membro = p.membros;
    if (!membro?.data_nascimento) return false;
    const nascimento = new Date(membro.data_nascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAniversario = nascimento.getMonth() - hoje.getMonth();
    if (
      mesAniversario > 0 ||
      (mesAniversario === 0 && nascimento.getDate() > hoje.getDate())
    ) {
      return idade - 1 < 18;
    }
    return idade < 18;
  }).length;

  const valorEsperado = participantes.reduce(
    (sum: number, p: any) => sum + (p.valor_a_pagar || 0),
    0
  );
  const totalPendente = valorEsperado - totalArrecadado;
  const percentualArrecadado =
    valorEsperado > 0 ? (totalArrecadado / valorEsperado) * 100 : 0;
  const saldo = totalArrecadado - totalGastos;

  return {
    totalParticipantes,
    totalIsentos,
    autorizacoesPendentes,
    valorEsperado,
    totalArrecadado,
    totalPendente,
    percentualArrecadado,
    totalGastos,
    saldo,
  };
}
