# SGB - Sistema de Gestão do Borba

## Visão Geral

Sistema de gestão para o Clube de Desbravadores Borba Gato (IASD Santo Amaro, fundado em 1965). O sistema gerencia unidades, membros, presenças em encontros, especialidades e mensalidades.

## Stack Tecnológica

- **Frontend/Backend:** Next.js 14+ (App Router)
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Estilização:** Tailwind CSS
- **Deploy:** Vercel
- **Linguagem:** TypeScript

## Convenções de Código

### Nomenclatura

- **Banco de dados (SQL):** snake_case (`data_nascimento`, `criado_em`)
- **TypeScript/React:** camelCase (`dataNascimento`, `criadoEm`)
- **Arquivos e pastas:** kebab-case (`minha-unidade.tsx`, `use-auth.ts`)
- **Componentes React:** PascalCase (`MemberCard.tsx`, `AttendanceForm.tsx`)

### Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── encontros/
│   │   │   ├── relatorios/
│   │   │   └── page.tsx
│   │   ├── secretaria/
│   │   │   ├── membros/
│   │   │   ├── unidades/
│   │   │   └── page.tsx
│   │   ├── tesoureiro/
│   │   │   ├── mensalidades/
│   │   │   └── page.tsx
│   │   ├── conselheiro/
│   │   │   ├── minha-unidade/
│   │   │   ├── chamada/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── ...
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── forms/
│   │   ├── member-form.tsx
│   │   ├── unit-form.tsx
│   │   ├── attendance-form.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── nav-link.tsx
│   │   └── ...
│   └── shared/
│       ├── loading.tsx
│       ├── error-boundary.tsx
│       └── ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── types.ts
│   ├── utils/
│   │   ├── case-converter.ts
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── cn.ts
│   └── constants.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-user.ts
│   ├── use-members.ts
│   ├── use-units.ts
│   └── ...
├── types/
│   ├── database.ts
│   ├── auth.ts
│   ├── member.ts
│   ├── unit.ts
│   └── index.ts
├── services/
│   ├── members.ts
│   ├── units.ts
│   ├── attendance.ts
│   ├── payments.ts
│   └── ...
└── middleware.ts
```

## Identidade Visual

### Paleta de Cores

```css
:root {
  --color-primary: #1a2b5f; /* Azul marinho */
  --color-secondary: #f5c518; /* Amarelo/Dourado */
  --color-primary-light: #2a3b6f;
  --color-primary-dark: #0a1b4f;
  --color-background: #f5f7fa;
  --color-surface: #ffffff;
  --color-text: #1a1a1a;
  --color-text-muted: #6b7280;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a2b5f",
          light: "#2a3b6f",
          dark: "#0a1b4f",
        },
        secondary: {
          DEFAULT: "#f5c518",
        },
      },
    },
  },
};
```

## Modelo de Dados

### Enums

```typescript
type PapelUsuario = "admin" | "secretaria" | "tesoureiro" | "conselheiro";
type TipoMembro = "desbravador" | "diretoria";
type TipoClasse = "desbravador" | "diretoria";
type StatusEncontro = "agendado" | "em_andamento" | "finalizado";
type StatusPresenca = "pontual" | "atrasado" | "falta" | "falta_justificada";
type StatusMensalidade = "pendente" | "pago";
```

### Tipos Principais

```typescript
interface Usuario {
  id: string;
  email: string;
  nome: string;
  papel: PapelUsuario;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

interface Unidade {
  id: string;
  nome: string;
  descricao?: string;
  corPrimaria: string;
  corSecundaria: string;
  ativa: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

interface Membro {
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

interface Encontro {
  id: string;
  data: Date;
  descricao?: string;
  status: StatusEncontro;
  criadoPor?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

interface Presenca {
  id: string;
  encontroId: string;
  membroId: string;
  status: StatusPresenca;
  temMaterial: boolean;
  temUniforme: boolean;
  observacao?: string;
  registradoPor?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

## Papéis e Permissões

| Papel           | Acesso                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| **Admin**       | CRUD total em todas as tabelas                                                                       |
| **Secretaria**  | CRUD total em todas as tabelas                                                                       |
| **Tesoureiro**  | CRUD total em todas as tabelas                                                                       |
| **Conselheiro** | Visualiza/edita apenas dados da sua unidade. Visualiza mensalidades da sua unidade (somente leitura) |

## Funcionalidades por Papel

### Admin

- Dashboard com visão geral do clube
- Criar/gerenciar encontros
- Relatórios de presença, pontualidade e ranking de unidades
- Acesso a todas as funcionalidades

### Secretaria

- Cadastro de membros (desbravadores e diretoria)
- Cadastro e gestão de unidades
- Vincular conselheiros às unidades
- Gerenciar especialidades e classes

### Tesoureiro

- Controle de mensalidades
- Marcar pagamentos
- Relatório de inadimplentes

### Conselheiro

- Visualizar membros da sua unidade
- Fazer chamada nos encontros
- Registrar especialidades conquistadas
- Histórico de presença da unidade

## Fluxos Principais

### Fluxo de Chamada

1. Admin cria um encontro com data e status "agendado"
2. No dia, admin muda status para "em_andamento"
3. Conselheiros acessam e registram presença de cada membro:
   - Status: pontual / atrasado / falta / falta_justificada
   - Material: sim / não
   - Uniforme: sim / não
4. Ao finalizar, admin muda status para "finalizado"

### Fluxo de Cadastro de Membro

1. Secretaria acessa cadastro de membros
2. Preenche dados: nome, data nascimento, tipo, unidade, classe
3. Se menor de idade, preenche responsável e telefone
4. Membro fica ativo por padrão

## Utilitários Necessários

### Conversor de Case

```typescript
// lib/utils/case-converter.ts
export function snakeToCamel<T>(obj: any): T {
  // Converte snake_case para camelCase
}

export function camelToSnake<T>(obj: any): T {
  // Converte camelCase para snake_case
}
```

### Cliente Supabase

```typescript
// lib/supabase/client.ts - Client-side
// lib/supabase/server.ts - Server-side com cookies
```

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar linting
npm run lint

# Gerar tipos do Supabase
npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts
```

## Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

## Padrões de Implementação

### Componentes

- Usar Server Components por padrão
- Client Components apenas quando necessário (interatividade, hooks)
- Marcar com 'use client' no topo do arquivo

### Data Fetching

- Server Components: fetch direto com Supabase server client
- Client Components: usar hooks customizados com SWR ou React Query

### Forms

- Usar React Hook Form para formulários complexos
- Validação com Zod
- Server Actions para submissão quando possível

### Tratamento de Erros

- Try/catch em todas as operações assíncronas
- Feedback visual para o usuário (toast, alerts)
- Log de erros para debugging

## Classes dos Desbravadores

### Regulares (em ordem de progressão)

1. Amigo
2. Companheiro
3. Pesquisador
4. Pioneiro
5. Excursionista
6. Guia

### Liderança (opcionais para diretoria)

1. Agrupada
2. Líder
3. Líder Master
