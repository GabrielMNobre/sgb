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
  usuarioId: string;
  principal: boolean;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}
