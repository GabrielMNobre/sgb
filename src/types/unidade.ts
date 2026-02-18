export interface Unidade {
  id: string;
  nome: string;
  descricao?: string;
  corPrimaria: string;
  corSecundaria: string;
  ativa: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface UnidadeFormData {
  nome: string;
  descricao?: string;
  corPrimaria: string;
  corSecundaria: string;
  ativa: boolean;
}

export interface UnidadeComConselheiros extends Unidade {
  conselheiros: ConselheiroVinculo[];
}

export interface ConselheiroVinculo {
  id: string;
  unidadeId: string;
  membroId: string;
  principal: boolean;
  membro: {
    id: string;
    nome: string;
  };
  temConta?: boolean;
  usuarioId?: string;
}
