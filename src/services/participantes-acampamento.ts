import { createClient } from "@/lib/supabase/server";
import { snakeToCamel, camelToSnake } from "@/lib/utils/case-converter";
import type {
  ParticipanteAcampamento,
  ParticipanteComPagamentos,
  ParticipanteFormData,
  FiltrosParticipante,
} from "@/types/acampamento";
import type { Membro } from "@/types/membro";
import { getMembrosAtivos } from "@/services/membros";

// ========== Consultas ==========

export async function getParticipantes(
  acampamentoId: string,
  filtros?: FiltrosParticipante
): Promise<ParticipanteComPagamentos[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("participantes_acampamento")
    .select(`
      *,
      membros (
        id,
        nome,
        data_nascimento,
        tipo,
        unidades (
          id,
          nome
        )
      )
    `)
    .eq("acampamento_id", acampamentoId);

  if (error) {
    console.error("Erro ao buscar participantes:", error);
    throw new Error("Erro ao buscar participantes");
  }

  // Fetch pagamentos for all participants
  const participanteIds = (data || []).map((p: any) => p.id);

  let allPagamentos: any[] = [];
  if (participanteIds.length > 0) {
    const { data: pagamentos, error: pagError } = await db
      .from("pagamentos_acampamento")
      .select("*")
      .in("participante_id", participanteIds);

    if (pagError) {
      console.error("Erro ao buscar pagamentos:", pagError);
      throw new Error("Erro ao buscar pagamentos dos participantes");
    }

    allPagamentos = pagamentos || [];
  }

  // Map participants with nested data
  let results: ParticipanteComPagamentos[] = (data || []).map((p: any) => {
    const { membros, ...participanteData } = p;
    const participante = snakeToCamel<ParticipanteAcampamento>(participanteData);
    const pagamentosDoParticipante = allPagamentos.filter(
      (pg: any) => pg.participante_id === p.id
    );
    const totalPago = pagamentosDoParticipante.reduce(
      (sum: number, pg: any) => sum + (pg.valor || 0),
      0
    );

    return {
      ...participante,
      membro: membros
        ? {
            id: membros.id,
            nome: membros.nome,
            dataNascimento: membros.data_nascimento
              ? new Date(membros.data_nascimento)
              : undefined,
            tipo: membros.tipo,
            unidade: membros.unidades
              ? { id: membros.unidades.id, nome: membros.unidades.nome }
              : undefined,
          }
        : undefined,
      totalPago,
      pendente: Math.max(0, participante.valorAPagar - totalPago),
    } as ParticipanteComPagamentos;
  });

  // Apply filters in JS
  if (filtros?.status) {
    results = results.filter((p) => p.status === filtros.status);
  }

  if (filtros?.busca) {
    const busca = filtros.busca.toLowerCase();
    results = results.filter((p) =>
      p.membro?.nome?.toLowerCase().includes(busca)
    );
  }

  if (filtros?.situacaoPagamento) {
    results = results.filter((p) => {
      switch (filtros.situacaoPagamento) {
        case "em_dia":
          return p.totalPago >= p.valorAPagar;
        case "pendente":
          return p.totalPago > 0 && p.totalPago < p.valorAPagar;
        case "sem_pagamento":
          return p.totalPago === 0;
        default:
          return true;
      }
    });
  }

  if (filtros?.autorizacao) {
    results = results.filter((p) => {
      const isMenor = p.membro?.tipo === "desbravador";
      switch (filtros.autorizacao) {
        case "pendente":
          return !p.autorizacaoRecolhida && isMenor;
        case "recolhida":
          return p.autorizacaoRecolhida;
        default:
          return true;
      }
    });
  }

  // Order by membro.nome ASC
  results.sort((a, b) => {
    const nomeA = a.membro?.nome?.toLowerCase() || "";
    const nomeB = b.membro?.nome?.toLowerCase() || "";
    return nomeA.localeCompare(nomeB);
  });

  return results;
}

export async function getParticipanteById(
  id: string
): Promise<ParticipanteComPagamentos | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("participantes_acampamento")
    .select(`
      *,
      membros (
        id,
        nome,
        data_nascimento,
        tipo,
        unidades (
          id,
          nome
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Erro ao buscar participante:", error);
    throw new Error("Erro ao buscar participante");
  }

  // Fetch pagamentos for this participant
  const { data: pagamentos, error: pagError } = await db
    .from("pagamentos_acampamento")
    .select("*")
    .eq("participante_id", id);

  if (pagError) {
    console.error("Erro ao buscar pagamentos do participante:", pagError);
    throw new Error("Erro ao buscar pagamentos do participante");
  }

  const totalPago = (pagamentos || []).reduce(
    (sum: number, pg: any) => sum + (pg.valor || 0),
    0
  );

  const { membros, ...participanteData } = data;
  const participante = snakeToCamel<ParticipanteAcampamento>(participanteData);

  return {
    ...participante,
    membro: membros
      ? {
          id: membros.id,
          nome: membros.nome,
          dataNascimento: membros.data_nascimento
            ? new Date(membros.data_nascimento)
            : undefined,
          tipo: membros.tipo,
          unidade: membros.unidades
            ? { id: membros.unidades.id, nome: membros.unidades.nome }
            : undefined,
        }
      : undefined,
    totalPago,
    pendente: Math.max(0, participante.valorAPagar - totalPago),
  } as ParticipanteComPagamentos;
}

// ========== Operações ==========

export async function inscreverParticipante(
  acampamentoId: string,
  formData: ParticipanteFormData,
  usuarioId: string
): Promise<ParticipanteAcampamento> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToInsert = camelToSnake({
    acampamentoId,
    membroId: formData.membroId,
    valorAPagar: formData.isento ? 0 : formData.valorAPagar,
    isento: formData.isento,
    motivoIsencao: formData.motivoIsencao || null,
    autorizacaoRecolhida: false,
    status: "inscrito",
  });

  const { data, error } = await db
    .from("participantes_acampamento")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("Erro ao inscrever participante:", error);
    throw new Error("Erro ao inscrever participante");
  }

  return snakeToCamel<ParticipanteAcampamento>(data);
}

export async function cancelarInscricao(
  id: string,
  valorDevolvido: number
): Promise<ParticipanteAcampamento> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const dataToUpdate = camelToSnake({
    status: "cancelado",
    dataCancelamento: new Date().toISOString().split("T")[0],
    valorDevolvido,
  });

  const { data, error } = await db
    .from("participantes_acampamento")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao cancelar inscrição:", error);
    throw new Error("Erro ao cancelar inscrição");
  }

  return snakeToCamel<ParticipanteAcampamento>(data);
}

export async function marcarAutorizacao(
  id: string,
  recolhida: boolean
): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("participantes_acampamento")
    .update({ autorizacao_recolhida: recolhida })
    .eq("id", id);

  if (error) {
    console.error("Erro ao marcar autorização:", error);
    throw new Error("Erro ao marcar autorização");
  }
}

export async function getMembrosDisponiveis(
  acampamentoId: string
): Promise<Membro[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get all active members
  const membrosAtivos = await getMembrosAtivos();

  // Get members already inscribed in this acampamento
  const { data: inscritos, error } = await db
    .from("participantes_acampamento")
    .select("membro_id")
    .eq("acampamento_id", acampamentoId)
    .eq("status", "inscrito");

  if (error) {
    console.error("Erro ao buscar participantes inscritos:", error);
    throw new Error("Erro ao buscar participantes inscritos");
  }

  const idsInscritos = new Set(
    (inscritos || []).map((p: any) => p.membro_id)
  );

  // Filter out members who are already inscribed
  return membrosAtivos.filter((membro) => !idsInscritos.has(membro.id));
}
