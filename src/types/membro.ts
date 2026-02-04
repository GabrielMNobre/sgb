export type TipoMembro = "desbravador" | "diretoria";

export interface Membro {
  id: string;
  nome: string;
  dataNascimento?: Date;
  tipo: TipoMembro;
  unidadeId?: string;
  classeId?: string;
  telefone?: string;
  responsavel?: string;
  telefoneResponsavel?: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface MembroComRelacoes extends Membro {
  unidade?: {
    id: string;
    nome: string;
    corPrimaria: string;
  };
  classe?: {
    id: string;
    nome: string;
  };
}

export interface MembroFormData {
  nome: string;
  dataNascimento?: string;
  tipo: TipoMembro;
  unidadeId?: string;
  classeId?: string;
  telefone?: string;
  responsavel?: string;
  telefoneResponsavel?: string;
  ativo: boolean;
}

export interface Classe {
  id: string;
  nome: string;
  tipo: "desbravador" | "lideranca";
  ordem: number;
}

export const CLASSES_DESBRAVADOR: Omit<Classe, "id">[] = [
  { nome: "Amigo", tipo: "desbravador", ordem: 1 },
  { nome: "Companheiro", tipo: "desbravador", ordem: 2 },
  { nome: "Pesquisador", tipo: "desbravador", ordem: 3 },
  { nome: "Pioneiro", tipo: "desbravador", ordem: 4 },
  { nome: "Excursionista", tipo: "desbravador", ordem: 5 },
  { nome: "Guia", tipo: "desbravador", ordem: 6 },
];

export const CLASSES_LIDERANCA: Omit<Classe, "id">[] = [
  { nome: "Agrupada", tipo: "lideranca", ordem: 1 },
  { nome: "Líder", tipo: "lideranca", ordem: 2 },
  { nome: "Líder Master", tipo: "lideranca", ordem: 3 },
];
