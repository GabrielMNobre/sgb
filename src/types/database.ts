// Tipos gerados do Supabase - serão atualizados com npx supabase gen types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          nome: string;
          papel: "admin" | "secretaria" | "tesoureiro" | "conselheiro";
          ativo: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id: string;
          email: string;
          nome: string;
          papel: "admin" | "secretaria" | "tesoureiro" | "conselheiro";
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nome?: string;
          papel?: "admin" | "secretaria" | "tesoureiro" | "conselheiro";
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
      };
      unidades: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          cor_primaria: string;
          cor_secundaria: string;
          ativa: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          descricao?: string | null;
          cor_primaria: string;
          cor_secundaria: string;
          ativa?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string | null;
          cor_primaria?: string;
          cor_secundaria?: string;
          ativa?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
      };
      membros: {
        Row: {
          id: string;
          nome: string;
          data_nascimento: string | null;
          tipo: "desbravador" | "diretoria";
          unidade_id: string | null;
          classe_id: string | null;
          telefone: string | null;
          responsavel: string | null;
          telefone_responsavel: string | null;
          ativo: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          data_nascimento?: string | null;
          tipo: "desbravador" | "diretoria";
          unidade_id?: string | null;
          classe_id?: string | null;
          telefone?: string | null;
          responsavel?: string | null;
          telefone_responsavel?: string | null;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          data_nascimento?: string | null;
          tipo?: "desbravador" | "diretoria";
          unidade_id?: string | null;
          classe_id?: string | null;
          telefone?: string | null;
          responsavel?: string | null;
          telefone_responsavel?: string | null;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
      };
      encontros: {
        Row: {
          id: string;
          data: string;
          descricao: string | null;
          status: "agendado" | "em_andamento" | "finalizado";
          criado_por: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          data: string;
          descricao?: string | null;
          status?: "agendado" | "em_andamento" | "finalizado";
          criado_por?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          data?: string;
          descricao?: string | null;
          status?: "agendado" | "em_andamento" | "finalizado";
          criado_por?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
      };
      presencas: {
        Row: {
          id: string;
          encontro_id: string;
          membro_id: string;
          status: "pontual" | "atrasado" | "falta" | "falta_justificada";
          tem_material: boolean;
          tem_uniforme: boolean;
          observacao: string | null;
          registrado_por: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          encontro_id: string;
          membro_id: string;
          status: "pontual" | "atrasado" | "falta" | "falta_justificada";
          tem_material?: boolean;
          tem_uniforme?: boolean;
          observacao?: string | null;
          registrado_por?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          encontro_id?: string;
          membro_id?: string;
          status?: "pontual" | "atrasado" | "falta" | "falta_justificada";
          tem_material?: boolean;
          tem_uniforme?: boolean;
          observacao?: string | null;
          registrado_por?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
