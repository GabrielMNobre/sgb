"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createClientePaes,
  updateClientePaes,
  toggleClientePaesAtivo,
} from "@/services/clientes-paes";
import {
  createSemanaPaes,
  updateCustoProducao,
  finalizarSemanaPaes,
} from "@/services/semanas-paes";
import {
  createPedidoPaes,
  updatePedidoPaes,
  deletePedidoPaes,
  marcarPagoPaes,
  marcarEntreguePaes,
  marcarNaoEntreguePaes,
  criarPedidoSemDono,
} from "@/services/pedidos-paes";
import {
  createPedidoRecorrentePaes,
  cancelarPedidoRecorrente,
  gerarPedidosRecorrentesParaSemana,
} from "@/services/pedidos-recorrentes-paes";
import { updateConfiguracoes } from "@/services/configuracoes-paes";
import type {
  ClientePaesFormData,
  SemanaPaesFormData,
  PedidoPaesFormData,
  PedidoRecorrentePaesFormData,
  ConfiguracoesPaesFormData,
} from "@/types/paes";

function revalidatePaes() {
  revalidatePath("/tesoureiro/receitas/paes");
  revalidatePath("/tesoureiro");
  revalidatePath("/admin/financeiro/receitas/paes");
}

// ========== Clientes Actions ==========

export async function criarClientePaesAction(formData: ClientePaesFormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await createClientePaes(formData);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar cliente de pães:", error);
    return { success: false, error: "Erro ao criar cliente de pães" };
  }
}

export async function atualizarClientePaesAction(
  id: string,
  formData: ClientePaesFormData
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await updateClientePaes(id, formData);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar cliente de pães:", error);
    return { success: false, error: "Erro ao atualizar cliente de pães" };
  }
}

export async function toggleClientePaesAtivoAction(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await toggleClientePaesAtivo(id);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar status do cliente de pães:", error);
    return {
      success: false,
      error: "Erro ao alterar status do cliente de pães",
    };
  }
}

// ========== Semanas Actions ==========

export async function criarSemanaPaesAction(formData: SemanaPaesFormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const semana = await createSemanaPaes(formData);

    // Gera pedidos automaticamente para recorrentes ativos
    try {
      const pedidosGerados = await gerarPedidosRecorrentesParaSemana(semana.id);
      console.log(`Recorrentes: ${pedidosGerados.length} pedidos gerados para semana ${semana.id}`);
    } catch (recError) {
      console.error("Erro ao gerar recorrentes (semana criada com sucesso):", recError);
    }

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar semana de pães:", error);
    return { success: false, error: "Erro ao criar semana de pães" };
  }
}

export async function atualizarCustoProducaoAction(
  id: string,
  custo: number
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await updateCustoProducao(id, custo);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar custo de produção:", error);
    return { success: false, error: "Erro ao atualizar custo de produção" };
  }
}

export async function finalizarSemanaPaesAction(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await finalizarSemanaPaes(id);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao finalizar semana de pães:", error);
    return { success: false, error: "Erro ao finalizar semana de pães" };
  }
}

// ========== Pedidos Actions ==========

export async function criarPedidoPaesAction(formData: PedidoPaesFormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    if (formData.recorrente && formData.quantidadeSemanas) {
      const recorrenteData: PedidoRecorrentePaesFormData = {
        clienteId: formData.clienteId,
        quantidadePaes: formData.quantidade,
        quantidadeSemanas: formData.quantidadeSemanas,
        valorUnitario: formData.valorUnitario,
        semanaInicioId: formData.semanaId,
      };
      await createPedidoRecorrentePaes(recorrenteData);
    } else {
      await createPedidoPaes(formData, formData.pago ?? false);
    }

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar pedido de pães:", error);
    return { success: false, error: "Erro ao criar pedido de pães" };
  }
}

export async function editarPedidoPaesAction(id: string, formData: PedidoPaesFormData) {
  try {
    await updatePedidoPaes(id, formData);
    revalidatePaes();
    return { success: true };
  } catch (error) {
    console.error("Erro ao editar pedido de pães:", error);
    return { success: false, error: "Erro ao editar pedido de pães" };
  }
}

export async function excluirPedidoPaesAction(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await deletePedidoPaes(id);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir pedido de pães:", error);
    return { success: false, error: "Erro ao excluir pedido de pães" };
  }
}

export async function marcarPagoPaesAction(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await marcarPagoPaes(id);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar pedido como pago:", error);
    return { success: false, error: "Erro ao marcar pedido como pago" };
  }
}

export async function marcarEntreguePaesAction(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await marcarEntreguePaes(id);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar pedido como entregue:", error);
    return { success: false, error: "Erro ao marcar pedido como entregue" };
  }
}

export async function marcarNaoEntreguePaesAction(
  id: string,
  motivo: string
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await marcarNaoEntreguePaes(id, motivo);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar pedido como não entregue:", error);
    return {
      success: false,
      error: "Erro ao marcar pedido como não entregue",
    };
  }
}

export async function criarPedidoSemDonoAction(
  formData: PedidoPaesFormData,
  pago: boolean
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await criarPedidoSemDono(formData, pago);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar pedido sem dono:", error);
    return { success: false, error: "Erro ao criar pedido sem dono" };
  }
}

// ========== Pedidos Recorrentes Actions ==========

export async function cancelarRecorrentePaesAction(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await cancelarPedidoRecorrente(id);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar pedido recorrente:", error);
    return { success: false, error: "Erro ao cancelar pedido recorrente" };
  }
}

export async function gerarRecorrentesParaSemanaAction(semanaId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await gerarPedidosRecorrentesParaSemana(semanaId);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao gerar pedidos recorrentes para semana:", error);
    return {
      success: false,
      error: "Erro ao gerar pedidos recorrentes para semana",
    };
  }
}

// ========== Configurações Actions ==========

export async function atualizarConfiguracoesPaesAction(
  formData: ConfiguracoesPaesFormData
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    await updateConfiguracoes(formData);

    revalidatePaes();

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar configurações de pães:", error);
    return {
      success: false,
      error: "Erro ao atualizar configurações de pães",
    };
  }
}
