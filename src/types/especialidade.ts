export type CategoriaEspecialidade = string;

export interface Especialidade {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string;
  ativa: boolean;
  criadoEm: Date;
}

export interface EspecialidadeFormData {
  nome: string;
  categoria: string;
  descricao?: string;
  ativa: boolean;
}

export interface MembroEspecialidade {
  id: string;
  membroId: string;
  especialidadeId: string;
  dataConclusao: Date;
  entregue: boolean;
  dataEntrega?: Date;
  observacao?: string;
  registradoPor?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface MembroEspecialidadeComRelacoes extends MembroEspecialidade {
  especialidade: {
    id: string;
    nome: string;
    categoria: string;
  };
  membro?: {
    id: string;
    nome: string;
    unidadeId?: string;
    unidadeNome?: string;
  };
}

export interface MembroEspecialidadeFormData {
  membroId: string;
  especialidadeId: string;
  dataConclusao: string;
  entregue: boolean;
  dataEntrega?: string;
  observacao?: string;
}

export interface EspecialidadePendente {
  id: string;
  membroId: string;
  membroNome: string;
  unidadeId?: string;
  unidadeNome?: string;
  especialidadeId: string;
  especialidadeNome: string;
  dataConclusao: Date;
}
