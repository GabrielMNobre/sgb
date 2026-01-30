# SGB - Setup Inicial do Projeto

## Visão Geral

Este documento contém as instruções para criar e configurar o projeto Next.js do SGB - Sistema de Gestão do Borba.

## Criação do Projeto

```bash
# Criar projeto Next.js
npx create-next-app@latest sgb --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Entrar na pasta
cd sgb
```

## Dependências

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Utilitários
npm install clsx tailwind-merge
npm install lucide-react

# Formulários e validação
npm install react-hook-form zod @hookform/resolvers

# Data e formatação
npm install date-fns

# Dev dependencies
npm install -D @types/node
```

## Estrutura de Pastas

Criar a seguinte estrutura dentro de `src/`:

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
│   │   │   │   └── page.tsx
│   │   │   ├── relatorios/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── secretaria/
│   │   │   ├── membros/
│   │   │   │   └── page.tsx
│   │   │   ├── unidades/
│   │   │   │   └── page.tsx
│   │   │   ├── especialidades/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── tesoureiro/
│   │   │   ├── mensalidades/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── conselheiro/
│   │   │   ├── minha-unidade/
│   │   │   │   └── page.tsx
│   │   │   ├── chamada/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── .gitkeep
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── loading.tsx
│   │   └── toast.tsx
│   ├── forms/
│   │   └── .gitkeep
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── nav-link.tsx
│   └── shared/
│       └── .gitkeep
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── case-converter.ts
│   │   ├── date.ts
│   │   └── format.ts
│   └── constants.ts
├── hooks/
│   ├── use-auth.ts
│   └── .gitkeep
├── types/
│   ├── database.ts
│   ├── auth.ts
│   └── index.ts
├── services/
│   └── .gitkeep
└── middleware.ts
```

## Variáveis de Ambiente

Criar arquivo `.env.local` na raiz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key

# Opcional - para operações admin
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

Criar arquivo `.env.example` para referência:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Configuração do Tailwind

Atualizar `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a2b5f",
          light: "#2a3b6f",
          dark: "#0a1b4f",
          50: "#f0f3ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#1a2b5f",
          600: "#161f4a",
          700: "#121936",
          800: "#0d1226",
          900: "#080c19",
        },
        secondary: {
          DEFAULT: "#f5c518",
          light: "#ffd84d",
          dark: "#c9a000",
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f5c518",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

## Estilos Globais

Atualizar `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #1a2b5f;
    --color-secondary: #f5c518;
  }

  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply bg-secondary text-primary px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-outline {
    @apply border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors;
  }

  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }

  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
}
```

## Utilitários Base

### cn.ts (Class Names)

```typescript
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### case-converter.ts

```typescript
// src/lib/utils/case-converter.ts

type AnyObject = Record<string, any>;

function isObject(obj: any): obj is AnyObject {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj);
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamel(item)) as T;
  }

  if (isObject(obj)) {
    const newObj: AnyObject = {};
    for (const key in obj) {
      const camelKey = toCamelCase(key);
      newObj[camelKey] = snakeToCamel(obj[key]);
    }
    return newObj as T;
  }

  return obj as T;
}

export function camelToSnake<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnake(item)) as T;
  }

  if (isObject(obj)) {
    const newObj: AnyObject = {};
    for (const key in obj) {
      const snakeKey = toSnakeCase(key);
      newObj[snakeKey] = camelToSnake(obj[key]);
    }
    return newObj as T;
  }

  return obj as T;
}
```

### date.ts

```typescript
// src/lib/utils/date.ts
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(
  date: string | Date,
  pattern = "dd/MM/yyyy",
): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, pattern, { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

export function formatDateLong(date: string | Date): string {
  return formatDate(date, "dd 'de' MMMM 'de' yyyy");
}
```

### format.ts

```typescript
// src/lib/utils/format.ts

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}
```

### constants.ts

```typescript
// src/lib/constants.ts

export const APP_NAME = "SGB";
export const APP_FULL_NAME = "Sistema de Gestão do Borba";
export const CLUB_NAME = "Clube de Desbravadores Borba Gato";
export const CLUB_CHURCH = "IASD Santo Amaro";
export const CLUB_YEAR = 1965;

export const ROLES = {
  ADMIN: "admin",
  SECRETARIA: "secretaria",
  TESOUREIRO: "tesoureiro",
  CONSELHEIRO: "conselheiro",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  secretaria: "Secretaria",
  tesoureiro: "Tesoureiro",
  conselheiro: "Conselheiro",
};

export const PRESENCE_STATUS = {
  PONTUAL: "pontual",
  ATRASADO: "atrasado",
  FALTA: "falta",
  FALTA_JUSTIFICADA: "falta_justificada",
} as const;

export const PRESENCE_LABELS: Record<string, string> = {
  pontual: "Pontual",
  atrasado: "Atrasado",
  falta: "Falta",
  falta_justificada: "Falta Justificada",
};

export const MEETING_STATUS = {
  AGENDADO: "agendado",
  EM_ANDAMENTO: "em_andamento",
  FINALIZADO: "finalizado",
} as const;

export const MEETING_LABELS: Record<string, string> = {
  agendado: "Agendado",
  em_andamento: "Em Andamento",
  finalizado: "Finalizado",
};
```

## Componentes UI Base

### button.tsx

```typescript
// src/components/ui/button.tsx
import { cn } from '@/lib/utils/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-primary text-white hover:bg-primary-dark': variant === 'primary',
            'bg-secondary text-primary hover:bg-secondary-dark': variant === 'secondary',
            'border border-primary text-primary hover:bg-primary hover:text-white': variant === 'outline',
            'text-gray-600 hover:bg-gray-100': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
```

### input.tsx

```typescript
// src/components/ui/input.tsx
import { cn } from '@/lib/utils/cn'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'input',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
```

### card.tsx

```typescript
// src/components/ui/card.tsx
import { cn } from '@/lib/utils/cn'
import { HTMLAttributes, forwardRef } from 'react'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('card', className)}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-4', className)}
        {...props}
      />
    )
  }
)

CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-lg font-semibold text-gray-900', className)}
        {...props}
      />
    )
  }
)

CardTitle.displayName = 'CardTitle'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('', className)}
        {...props}
      />
    )
  }
)

CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
```

### loading.tsx

```typescript
// src/components/ui/loading.tsx
import { cn } from '@/lib/utils/cn'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Loading({ size = 'md', className }: LoadingProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
        {
          'h-4 w-4': size === 'sm',
          'h-8 w-8': size === 'md',
          'h-12 w-12': size === 'lg',
        },
        className
      )}
    />
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" />
    </div>
  )
}
```

## Layout Root

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SGB - Sistema de Gestão do Borba',
  description: 'Sistema de gestão do Clube de Desbravadores Borba Gato',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

## Página Inicial (Redirect)

```typescript
// src/app/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("papel")
      .eq("id", user.id)
      .single();

    const routes: Record<string, string> = {
      admin: "/admin",
      secretaria: "/secretaria",
      tesoureiro: "/tesoureiro",
      conselheiro: "/conselheiro",
    };

    redirect(routes[usuario?.papel || ""] || "/login");
  }

  redirect("/login");
}
```

## Scripts package.json

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "supabase:types": "npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts"
  }
}
```

## Checklist de Setup

- [ ] Criar projeto Next.js
- [ ] Instalar dependências
- [ ] Criar estrutura de pastas
- [ ] Configurar variáveis de ambiente
- [ ] Configurar Tailwind com cores do clube
- [ ] Criar estilos globais
- [ ] Criar utilitários (cn, case-converter, date, format)
- [ ] Criar constantes
- [ ] Criar componentes UI base (Button, Input, Card, Loading)
- [ ] Configurar layout root
- [ ] Criar página inicial com redirect
- [ ] Adicionar logo do clube em public/logo.png
