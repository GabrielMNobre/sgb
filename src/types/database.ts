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
      classes: {
        Row: {
          id: string;
          nome: string;
          tipo: "desbravador" | "lideranca";
          ordem: number;
        };
        Insert: {
          id?: string;
          nome: string;
          tipo: "desbravador" | "lideranca";
          ordem: number;
        };
        Update: {
          id?: string;
          nome?: string;
          tipo?: "desbravador" | "lideranca";
          ordem?: number;
        };
      };
      conselheiro_unidade: {
        Row: {
          id: string;
          unidade_id: string;
          usuario_id: string;
          principal: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          unidade_id: string;
          usuario_id: string;
          principal?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          unidade_id?: string;
          usuario_id?: string;
          principal?: boolean;
          criado_em?: string;
        };
      };
      historico_classes: {
        Row: {
          id: string;
          membro_id: string;
          classe_id: string;
          ano: number;
          criado_em: string;
        };
        Insert: {
          id?: string;
          membro_id: string;
          classe_id: string;
          ano: number;
          criado_em?: string;
        };
        Update: {
          id?: string;
          membro_id?: string;
          classe_id?: string;
          ano?: number;
          criado_em?: string;
        };
      };
      especialidades: {
        Row: {
          id: string;
          nome: string;
          categoria: "atividades_missionarias" | "atividades_profissionais" | "artes_habilidades_manuais" | "ciencia_saude" | "estudos_natureza" | "atividades_recreativas" | "atividades_agricolas" | "adra";
          descricao: string | null;
          ativa: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          categoria: "atividades_missionarias" | "atividades_profissionais" | "artes_habilidades_manuais" | "ciencia_saude" | "estudos_natureza" | "atividades_recreativas" | "atividades_agricolas" | "adra";
          descricao?: string | null;
          ativa?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          categoria?: "atividades_missionarias" | "atividades_profissionais" | "artes_habilidades_manuais" | "ciencia_saude" | "estudos_natureza" | "atividades_recreativas" | "atividades_agricolas" | "adra";
          descricao?: string | null;
          ativa?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
      };
      membro_especialidade: {
        Row: {
          id: string;
          membro_id: string;
          especialidade_id: string;
          data_conclusao: string;
          entregue: boolean;
          data_entrega: string | null;
          observacao: string | null;
          registrado_por: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          membro_id: string;
          especialidade_id: string;
          data_conclusao: string;
          entregue?: boolean;
          data_entrega?: string | null;
          observacao?: string | null;
          registrado_por?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          membro_id?: string;
          especialidade_id?: string;
          data_conclusao?: string;
          entregue?: boolean;
          data_entrega?: string | null;
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
