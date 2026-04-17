// ─── Enums ────────────────────────────────────────────────────────────────────

export type CategoriaCampeonato =
  | "compromisso"
  | "vida_unidade"
  | "identidade"
  | "formacao"
  | "social";

export type TipoAvaliacaoCampeonato =
  // Compromisso
  | "presenca"
  | "pontualidade"
  | "materiais"
  | "uniforme"
  | "postura"
  | "dinamicas"
  | "mensalidade"
  // Vida da Unidade
  | "diversificacao_atividades"
  | "realizacao_especialidades"
  | "protagonismo"
  | "planejamento_cantinho"
  | "engajamento_cantinho"
  | "realizacao_cantinho"
  | "organizacao_tempo_cantinho"
  | "lideranca_cantinho"
  | "qualidade_atividade_cantinho"
  | "envolvimento_cantinho"
  | "vivencia_habilidades"
  | "participacao_ativa_tecnico"
  | "evolucao_tecnica"
  | "seguranca_procedimentos"
  | "aplicacao_pratica_habilidades"
  | "ordem_unida"
  | "nos_amarras"
  | "desempenho_atividade_aplicada"
  // Identidade
  | "banderim"
  | "uniforme_unidade"
  | "grito_guerra"
  | "participacao_momentos_coletivos"
  | "atuacao_unidade_eventos"
  | "comunicacao_registro"
  | "criatividade_expressao"
  // Formação
  | "classe_regular"
  | "classe_avancada"
  | "classe_biblica"
  | "especialidades"
  // Social
  | "arrecadacao_alimentos"
  | "desafios_solidarios";

export type CorAvaliacao = "verde" | "amarelo" | "vermelho";

export type TipoDemerito =
  // D1 - Leves
  | "d1_esquecimento_materiais"
  | "d1_atraso_injustificado"
  | "d1_falta_atencao"
  | "d1_desrespeito_leve"
  | "d1_descuido_materiais"
  | "d1_postura_inadequada"
  | "d1_falta_colaboracao"
  | "d1_celular_inadequado"
  // D2 - Moderados
  | "d2_reincidencia_d1"
  | "d2_desrespeito_direto"
  | "d2_desobediencia"
  | "d2_comportamento_prejudicial"
  | "d2_perturbacao"
  | "d2_uso_indevido_materiais"
  | "d2_falta_injustificada"
  | "d2_postura_evento"
  | "d2_atrapalhar_atividades"
  // D3 - Graves
  | "d3_desrespeito_lideranca"
  | "d3_comportamento_agressivo"
  | "d3_risco_seguranca"
  | "d3_dano_intencional"
  | "d3_desobediencia_seguranca"
  | "d3_conduta_incopativel"
  | "d3_reincidencia_d2"
  | "d3_compromete_imagem"
  // D4 - Críticos
  | "d4_agressao_fisica"
  | "d4_risco_vida"
  | "d4_desrespeito_extremo"
  | "d4_conduta_incompativel_publica"
  | "d4_violacao_seguranca"
  | "d4_reincidencia_d3"
  | "d4_dano_grave"
  | "d4_consequencias_institucionais";

export type StatusCampeonato = "ativo" | "encerrado" | "suspenso";

// ─── DB Interfaces ─────────────────────────────────────────────────────────────

export interface Campeonato {
  id: string;
  nome: string;
  ano: number;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
  status: StatusCampeonato;
  criadoEm: string;
}

export interface RankingCampeonato {
  id: string;
  campeonatoId: string;
  unidadeId: string;
  pontosTotais: number;
  posicao: number;
  atualizadoEm: string;
}

export interface AvaliacaoCampeonato {
  id: string;
  campeonatoId: string;
  unidadeId: string;
  dataAvaliacao: string;
  categoria: CategoriaCampeonato;
  tipoAvaliacao: TipoAvaliacaoCampeonato;
  cor: CorAvaliacao;
  pontos: number;
  descricao?: string;
  criadaPor?: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface DemeritoCampeonato {
  id: string;
  campeonatoId: string;
  unidadeId: string;
  dataOcorrencia: string;
  tipoDemeritos: TipoDemerito;
  pontosPerdidos: number;
  descricao?: string;
  registradoPor?: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface AcompanhamentoClasses {
  id: string;
  campeonatoId: string;
  unidadeId: string;
  classeRegularCompletada: boolean;
  dataConclusaoRegular?: string;
  classeAvancadaCompletada: boolean;
  dataConclusaoAvancada?: string;
  classeBiblicaEmDia: boolean;
  totalEspecialidades: number;
  atualizadoEm: string;
}

// ─── Form Interfaces ───────────────────────────────────────────────────────────

export interface AvaliacaoFormData {
  unidadeId: string;
  dataAvaliacao: string;
  categoria: CategoriaCampeonato;
  tipoAvaliacao: TipoAvaliacaoCampeonato;
  cor: CorAvaliacao;
  descricao?: string;
}

export interface DemeritoFormData {
  unidadeId: string;
  dataOcorrencia: string;
  tipoDemeritos: TipoDemerito;
  descricao?: string;
}

export interface ClassesFormData {
  classeRegularCompletada: boolean;
  dataConclusaoRegular?: string;
  classeAvancadaCompletada: boolean;
  dataConclusaoAvancada?: string;
  classeBiblicaEmDia: boolean;
  totalEspecialidades: number;
}

// ─── Response Types ────────────────────────────────────────────────────────────

export interface DashboardConselheiro {
  unidadeNome: string;
  unidadeCor: string;
  totalPontos: number;
  pontosDia: number;
  demeritosDia: number;
  saldoDia: number;
}

export interface HistoricoItem {
  dataRegistro: string;
  tipoRegistro: "avaliacao" | "demeritos";
  categoria?: string;
  tipo: string;
  tipoAvaliacao?: string;
  descricao?: string;
  cor?: string;
  pontosGanhos: number;
  pontosPerdidos: number;
  totalDia: number;
}

export interface MetaCampeonato {
  nome: string;
  pontos: number;
  status:
    | "disponivel"
    | "concluido"
    | "vencido"
    | "em_progresso"
    | "em_dia"
    | "com_atraso";
  prazo?: string;
  progresso?: { atual: number; maximo: number };
}

export interface RankingItem {
  posicao: number;
  unidadeId: string;
  unidadeNome: string;
  unidadeCor: string;
  total: number;
  compromisso: number;
  dinamicas: number;
  mensalidades: number;
  vidaUnidade: number;
  identidade: number;
  formacao: number;
  social: number;
  demeritos: number;
  classes: number;
  badge: "🥇" | "🥈" | "🥉" | "";
}

export interface DashboardExecutivo {
  totalAvaliacoes: number;
  totalDemeritos: number;
  unidadesParticipantes: number;
  diasCampanha: number;
  top5: { nome: string; pontos: number }[];
}

export interface AtividadeItem {
  data: string;
  numAvaliacoes: number;
  totalDemeritos: number;
}

export interface StatusClasseItem {
  tipo: "regular" | "avancada" | "biblica";
  concluidas: number;
  total: number;
  percentual: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const CATEGORIAS_LABELS: Record<CategoriaCampeonato, string> = {
  compromisso: "Compromisso",
  vida_unidade: "Vida da Unidade",
  identidade: "Identidade",
  formacao: "Formação",
  social: "Social",
};

export const CATEGORIAS_CORES: Record<CategoriaCampeonato, string> = {
  compromisso: "#007BFF",
  vida_unidade: "#28A745",
  identidade: "#6F42C1",
  formacao: "#FD7E14",
  social: "#E83E8C",
};

export const TIPOS_POR_CATEGORIA: Record<
  CategoriaCampeonato,
  { value: TipoAvaliacaoCampeonato; label: string }[]
> = {
  compromisso: [
    { value: "presenca", label: "Presença" },
    { value: "pontualidade", label: "Pontualidade" },
    { value: "materiais", label: "Materiais" },
    { value: "uniforme", label: "Uniforme" },
    { value: "postura", label: "Postura" },
    { value: "dinamicas", label: "Dinâmicas" },
  ],
  vida_unidade: [
    { value: "diversificacao_atividades", label: "Diversificação de Atividades" },
    { value: "realizacao_especialidades", label: "Realização de Especialidades" },
    { value: "protagonismo", label: "Protagonismo" },
    { value: "planejamento_cantinho", label: "Planejamento do Cantinho" },
    { value: "engajamento_cantinho", label: "Engajamento no Cantinho" },
    { value: "realizacao_cantinho", label: "Realização do Cantinho" },
    { value: "organizacao_tempo_cantinho", label: "Organização do Tempo no Cantinho" },
    { value: "lideranca_cantinho", label: "Liderança no Cantinho" },
    { value: "qualidade_atividade_cantinho", label: "Qualidade da Atividade no Cantinho" },
    { value: "envolvimento_cantinho", label: "Envolvimento no Cantinho" },
    { value: "vivencia_habilidades", label: "Vivência de Habilidades" },
    { value: "participacao_ativa_tecnico", label: "Participação Ativa Técnica" },
    { value: "evolucao_tecnica", label: "Evolução Técnica" },
    { value: "seguranca_procedimentos", label: "Segurança e Procedimentos" },
    { value: "aplicacao_pratica_habilidades", label: "Aplicação Prática de Habilidades" },
    { value: "ordem_unida", label: "Ordem Unida" },
    { value: "nos_amarras", label: "Nós e Amarras" },
    { value: "desempenho_atividade_aplicada", label: "Desempenho em Atividade Aplicada" },
  ],
  identidade: [
    { value: "banderim", label: "Banderim" },
    { value: "uniforme_unidade", label: "Uniforme da Unidade" },
    { value: "grito_guerra", label: "Grito de Guerra" },
    { value: "participacao_momentos_coletivos", label: "Participação em Momentos Coletivos" },
    { value: "atuacao_unidade_eventos", label: "Atuação da Unidade em Eventos" },
    { value: "comunicacao_registro", label: "Comunicação e Registro" },
    { value: "criatividade_expressao", label: "Criatividade e Expressão" },
  ],
  formacao: [
    { value: "classe_regular", label: "Classe Regular" },
    { value: "classe_avancada", label: "Classe Avançada" },
    { value: "classe_biblica", label: "Classe Bíblica" },
    { value: "especialidades", label: "Especialidades" },
  ],
  social: [
    { value: "arrecadacao_alimentos", label: "Arrecadação de Alimentos" },
    { value: "desafios_solidarios", label: "Desafios Solidários" },
  ],
};

export const COR_PONTOS: Record<CorAvaliacao, number> = {
  verde: 50,
  amarelo: 30,
  vermelho: 10,
};

export const COR_LABELS: Record<CorAvaliacao, string> = {
  verde: "Verde",
  amarelo: "Amarelo",
  vermelho: "Vermelho",
};

export const DEMERITOS_CONFIG: {
  value: TipoDemerito;
  label: string;
  nivel: "D1" | "D2" | "D3" | "D4";
  pontos: number;
}[] = [
  // D1
  { value: "d1_esquecimento_materiais", label: "Esquecimento de Materiais", nivel: "D1", pontos: -5 },
  { value: "d1_atraso_injustificado",   label: "Atraso Injustificado",       nivel: "D1", pontos: -5 },
  { value: "d1_falta_atencao",          label: "Falta de Atenção",           nivel: "D1", pontos: -5 },
  { value: "d1_desrespeito_leve",       label: "Desrespeito Leve",           nivel: "D1", pontos: -10 },
  { value: "d1_descuido_materiais",     label: "Descuido com Materiais",     nivel: "D1", pontos: -5 },
  { value: "d1_postura_inadequada",     label: "Postura Inadequada",         nivel: "D1", pontos: -5 },
  { value: "d1_falta_colaboracao",      label: "Falta de Colaboração",       nivel: "D1", pontos: -5 },
  { value: "d1_celular_inadequado",     label: "Uso Inadequado do Celular",  nivel: "D1", pontos: -5 },
  // D2
  { value: "d2_reincidencia_d1",           label: "Reincidência D1",                   nivel: "D2", pontos: -10 },
  { value: "d2_desrespeito_direto",        label: "Desrespeito Direto",                nivel: "D2", pontos: -15 },
  { value: "d2_desobediencia",             label: "Desobediência",                     nivel: "D2", pontos: -15 },
  { value: "d2_comportamento_prejudicial", label: "Comportamento Prejudicial",         nivel: "D2", pontos: -15 },
  { value: "d2_uso_indevido_materiais",    label: "Uso Indevido de Materiais",         nivel: "D2", pontos: -20 },
  { value: "d2_falta_injustificada",       label: "Falta Injustificada",               nivel: "D2", pontos: -15 },
  { value: "d2_postura_evento",            label: "Postura Inadequada em Evento",      nivel: "D2", pontos: -15 },
  { value: "d2_atrapalhar_atividades",     label: "Atrapalhar Atividades",             nivel: "D2", pontos: -15 },
  // D3
  { value: "d3_desrespeito_lideranca",    label: "Desrespeito à Liderança",                nivel: "D3", pontos: -30 },
  { value: "d3_comportamento_agressivo",  label: "Comportamento Agressivo",                nivel: "D3", pontos: -40 },
  { value: "d3_risco_seguranca",          label: "Risco à Segurança",                      nivel: "D3", pontos: -50 },
  { value: "d3_dano_intencional",         label: "Dano Intencional",                       nivel: "D3", pontos: -40 },
  { value: "d3_desobediencia_seguranca",  label: "Desobediência a Normas de Segurança",    nivel: "D3", pontos: -50 },
  { value: "d3_conduta_incopativel",      label: "Conduta Incompatível",                   nivel: "D3", pontos: -40 },
  { value: "d3_reincidencia_d2",          label: "Reincidência D2",                        nivel: "D3", pontos: -30 },
  { value: "d3_compromete_imagem",        label: "Compromete a Imagem da Instituição",     nivel: "D3", pontos: -50 },
  // D4
  { value: "d4_agressao_fisica",                label: "Agressão Física",                    nivel: "D4", pontos: -80 },
  { value: "d4_risco_vida",                     label: "Risco de Vida",                      nivel: "D4", pontos: -100 },
  { value: "d4_dano_grave",                     label: "Dano Grave",                          nivel: "D4", pontos: -80 },
  { value: "d4_desrespeito_extremo",            label: "Desrespeito Extremo",                nivel: "D4", pontos: -70 },
  { value: "d4_conduta_incompativel_publica",   label: "Conduta Incompatível em Público",    nivel: "D4", pontos: -80 },
  { value: "d4_violacao_seguranca",             label: "Violação de Segurança",              nivel: "D4", pontos: -100 },
  { value: "d4_reincidencia_d3",                label: "Reincidência D3",                    nivel: "D4", pontos: -70 },
  { value: "d4_consequencias_institucionais",   label: "Consequências Institucionais",       nivel: "D4", pontos: -100 },
];

export const NIVEL_CORES: Record<string, string> = {
  D1: "#FFC107",
  D2: "#FD7E14",
  D3: "#DC3545",
  D4: "#721C24",
};
