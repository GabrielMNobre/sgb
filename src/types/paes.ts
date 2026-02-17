// === Status Types ===
export type StatusSemana = "aberta" | "finalizada";
export type StatusPagamento = "pago" | "pendente";
export type StatusEntrega = "pendente" | "entregue" | "nao_entregue";

// === Clientes ===
export interface ClientePaes {
  id: string;
  nome: string;
  ativo: boolean;
  criadoEm: Date;
}

export interface ClientePaesFormData {
  nome: string;
}

// === Semanas ===
export interface SemanaPaes {
  id: string;
  dataProducao: Date;
  dataEntrega: Date;
  custoProducao: number;
  status: StatusSemana;
  criadoEm: Date;
}

export interface SemanaPaesFormData {
  dataProducao: string;
  dataEntrega: string;
  custoProducao?: number;
}

export interface SemanaPaesComResumo extends SemanaPaes {
  totalPedidos: number;
  totalPaes: number;
  totalValor: number;
  totalPago: number;
  fornadas: number;
  paesSemDono: number;
}

// === Pedidos ===
export interface PedidoPaes {
  id: string;
  clienteId: string;
  semanaId: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  valorPago: number;
  creditoAplicado: number;
  statusPagamento: StatusPagamento;
  statusEntrega: StatusEntrega;
  motivoNaoEntrega?: string;
  pedidoRecorrenteId?: string;
  criadoEm: Date;
}

export interface PedidoPaesComCliente extends PedidoPaes {
  cliente?: ClientePaes | null;
}

export interface PedidoPaesComClienteESemana extends PedidoPaesComCliente {
  semana?: SemanaPaes | null;
}

export interface PedidoPaesFormData {
  clienteId: string;
  clienteNome?: string;
  semanaId: string;
  quantidade: number;
  valorUnitario: number;
  pago?: boolean;
  recorrente?: boolean;
  quantidadeSemanas?: number;
}

export interface FiltrosPedidoPaes {
  semanaId?: string;
  clienteId?: string;
  statusPagamento?: StatusPagamento;
  statusEntrega?: StatusEntrega;
}

// === Pedidos Recorrentes ===
export interface PedidoRecorrentePaes {
  id: string;
  clienteId: string;
  quantidadePaes: number;
  quantidadeSemanas: number;
  semanasRestantes: number;
  valorUnitario: number;
  valorTotal: number;
  semanaInicioId?: string;
  ativo: boolean;
  criadoEm: Date;
}

export interface PedidoRecorrentePaesComCliente extends PedidoRecorrentePaes {
  cliente?: ClientePaes | null;
}

export interface PedidoRecorrentePaesFormData {
  clienteId: string;
  quantidadePaes: number;
  quantidadeSemanas: number;
  valorUnitario: number;
  semanaInicioId?: string;
}

// === Créditos ===
export interface CreditoPaes {
  id: string;
  clienteId: string;
  quantidadeOriginal: number;
  quantidadeDisponivel: number;
  pedidoOrigemId?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface HistoricoUsoCredito {
  id: string;
  creditoId: string;
  pedidoId: string;
  quantidadeUsada: number;
  criadoEm: Date;
}

// === Configurações ===
export interface ConfiguracoesPaes {
  id: string;
  valorUnitarioPadrao: number;
  paesPorFornada: number;
  atualizadoEm: Date;
}

export interface ConfiguracoesPaesFormData {
  valorUnitarioPadrao: number;
  paesPorFornada: number;
}
