# SGB - Sistema de Gestão do Borba

Sistema de gestão para o **Clube de Desbravadores Borba Gato** (IASD Santo Amaro, fundado em 1965).

## Sobre o Projeto

O SGB gerencia:

- **Unidades** - Grupos de desbravadores com seus conselheiros
- **Membros** - Desbravadores e diretoria do clube
- **Presenças** - Controle de chamada nos encontros
- **Especialidades** - Registro de especialidades conquistadas
- **Mensalidades** - Controle financeiro

## Stack Tecnológica

| Tecnologia                                    | Uso                                      |
| --------------------------------------------- | ---------------------------------------- |
| [Next.js 16](https://nextjs.org/)             | Frontend e Backend (App Router)          |
| [Supabase](https://supabase.com/)             | Banco de dados PostgreSQL e Autenticação |
| [Tailwind CSS](https://tailwindcss.com/)      | Estilização                              |
| [TypeScript](https://www.typescriptlang.org/) | Linguagem                                |
| [Vercel](https://vercel.com/)                 | Deploy                                   |

## Começando

### Pré-requisitos

- Node.js 20.9+
- npm ou yarn
- Conta no Supabase

### Instalação

```bash
# Clonar o repositório
git clone <https://github.com/GabrielMNobre/sgb.git>
cd sgb

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Rodar em desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

## Scripts Disponíveis

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build para produção
npm run start     # Iniciar servidor de produção
npm run lint      # Verificar linting
```

## Papéis de Usuário

| Papel           | Acesso                                         |
| --------------- | ---------------------------------------------- |
| **Admin**       | Acesso total, gerencia encontros e relatórios  |
| **Secretaria**  | Cadastro de membros, unidades e especialidades |
| **Tesoureiro**  | Controle de mensalidades e pagamentos          |
| **Conselheiro** | Gerencia apenas sua unidade, faz chamadas      |

## Estrutura do Projeto

```
src/
├── app/                    # Rotas e páginas (App Router)
│   ├── (auth)/            # Páginas de autenticação
│   └── (dashboard)/       # Dashboards por papel
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Input, Card)
│   ├── forms/            # Formulários
│   └── layout/           # Componentes de layout
├── lib/                   # Utilitários e configurações
│   ├── supabase/         # Cliente Supabase
│   └── utils/            # Funções auxiliares
├── hooks/                 # React Hooks customizados
├── types/                 # Definições TypeScript
└── services/             # Lógica de negócio
```

## Convenções de Código

| Contexto       | Convenção  | Exemplo           |
| -------------- | ---------- | ----------------- |
| Banco de dados | snake_case | `data_nascimento` |
| TypeScript     | camelCase  | `dataNascimento`  |
| Arquivos       | kebab-case | `use-auth.ts`     |
| Componentes    | PascalCase | `MemberCard.tsx`  |

## Identidade Visual

- **Cor Primária:** `#1a2b5f` (Azul marinho)
- **Cor Secundária:** `#f5c518` (Amarelo/Dourado)
