import { calcularTotaisMensalidade } from "./mensalidades";
import { calcularTotalMesAtual as calcularTotalVendasMes, obterVendasUltimas } from "./vendas";
import { calcularTotalMesAtual as calcularTotalDoacoesMes, obterDoacoesUltimas } from "./doacoes";
import { calcularTotalPaesMesAtual } from "./pedidos-paes";

export interface ResumoReceitas {
  mensalidades: {
    total: number;
    quantidade: number;
  };
  vendas: {
    total: number;
    quantidade: number;
  };
  doacoes: {
    total: number;
    quantidade: number;
  };
  paes: {
    total: number;
  };
  totalGeral: number;
  distribuicao: Array<{
    fonte: string;
    valor: number;
    percentual: number;
    cor: string;
    corTexto: string;
  }>;
}

export async function calcularReceitasMesAtual(): Promise<ResumoReceitas> {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const [mensalidades, vendas, doacoes, paesTotal] = await Promise.all([
    calcularTotaisMensalidade(mesAtual, anoAtual),
    calcularTotalVendasMes(),
    calcularTotalDoacoesMes(),
    calcularTotalPaesMesAtual(),
  ]);

  const totalGeral =
    mensalidades.totalPago + vendas.total + doacoes.total + paesTotal;

  const distribuicao = [
    {
      fonte: "Mensalidades",
      valor: mensalidades.totalPago,
      percentual: totalGeral > 0 ? (mensalidades.totalPago / totalGeral) * 100 : 0,
      cor: "bg-blue-500",
      corTexto: "text-blue-700",
    },
    {
      fonte: "Vendas",
      valor: vendas.total,
      percentual: totalGeral > 0 ? (vendas.total / totalGeral) * 100 : 0,
      cor: "bg-purple-500",
      corTexto: "text-purple-700",
    },
    {
      fonte: "Doações",
      valor: doacoes.total,
      percentual: totalGeral > 0 ? (doacoes.total / totalGeral) * 100 : 0,
      cor: "bg-green-500",
      corTexto: "text-green-700",
    },
    {
      fonte: "Pães",
      valor: paesTotal,
      percentual: totalGeral > 0 ? (paesTotal / totalGeral) * 100 : 0,
      cor: "bg-amber-500",
      corTexto: "text-amber-700",
    },
  ].filter((item) => item.valor > 0); // Apenas fontes com valor

  return {
    mensalidades: {
      total: mensalidades.totalPago,
      quantidade: mensalidades.quantidadePaga,
    },
    vendas: {
      total: vendas.total,
      quantidade: vendas.quantidade,
    },
    doacoes: {
      total: doacoes.total,
      quantidade: doacoes.quantidade,
    },
    paes: {
      total: paesTotal,
    },
    totalGeral,
    distribuicao,
  };
}

export interface ReceitasPorPeriodo {
  mensalidades: number;
  vendas: number;
  doacoes: number;
  total: number;
}

export async function calcularReceitasPorPeriodo(
  dataInicio: string,
  dataFim: string
): Promise<ReceitasPorPeriodo> {
  // Esta função pode ser implementada quando necessário
  // Por enquanto retorna valores zerados
  return {
    mensalidades: 0,
    vendas: 0,
    doacoes: 0,
    total: 0,
  };
}
