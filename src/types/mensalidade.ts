export type StatusMensalidade = "pendente" | "pago";

export interface Mensalidade {
  id: string;
  membroId: string;
  mes: number; // 1-12
  ano: number;
  dataPagamento?: Date;
  valor: number;
  status: StatusMensalidade;
  registradoPor?: string; // UUID do usuário que registrou o pagamento
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface MensalidadeComRelacoes extends Mensalidade {
  membro: {
    id: string;
    nome: string;
    tipo: "desbravador" | "diretoria";
    isentoMensalidade: boolean;
    unidade?: {
      id: string;
      nome: string;
      corPrimaria: string;
    };
  };
}

export interface MensalidadeFormData {
  membroId: string;
  mes: number;
  ano: number;
  dataPagamento?: string;
  valor: number;
  status: StatusMensalidade;
}

export interface RegistrarPagamentoFormData {
  mensalidadeIds: string[];
  dataPagamento: string;
}

export interface FiltrosMensalidade {
  mes?: number;
  ano?: number;
  status?: StatusMensalidade;
  tipo?: "desbravador" | "diretoria";
  unidadeId?: string;
  busca?: string;
}

export interface TotaisMensalidade {
  totalPago: number;
  totalPendente: number;
  totalGeral: number;
  quantidadePaga: number;
  quantidadePendente: number;
  quantidadeTotal: number;
}

export interface TaxaAdesao {
  tipo: "desbravador" | "diretoria";
  totalAtivos: number; // Excludes exempt
  totalPago: number;
  totalPendente: number;
  percentualAdesao: number;
}

export interface MetaMensal {
  mes: number;
  ano: number;
  valorPossivel: number; // Total if all non-exempt paid
  valorMeta: number; // 80% of valorPossivel
  valorArrecadado: number;
  percentualAlcancado: number;
  membrosAtivos: number; // Non-exempt
  membrosPagos: number;
}

export interface ReceitaMensal {
  mes: number;
  ano: number;
  mesNome: string;
  totalDesbravadores: number;
  totalDiretoria: number;
  totalGeral: number;
}

export interface MembroInadimplente {
  membroId: string;
  membroNome: string;
  tipo: "desbravador" | "diretoria";
  unidade?: {
    id: string;
    nome: string;
    corPrimaria: string;
  };
  quantidadePendente: number;
  valorPendente: number;
  mesesPendentes: string[]; // ["Jan/2024", "Fev/2024"]
}

export interface HistoricoMensalidade {
  ano: number;
  totalPago: number;
  totalPendente: number;
  quantidadePaga: number;
  quantidadePendente: number;
  meses: {
    mes: number;
    mesNome: string;
    status: StatusMensalidade;
    valor: number;
    dataPagamento?: Date;
  }[];
}
