# SGB - Autenticação

## Visão Geral

O sistema utiliza Supabase Auth para autenticação com email/senha. Após login, o usuário é redirecionado para a área correspondente ao seu papel.

## Dependências

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Estrutura de Arquivos

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx        # Página de login
│   │   └── layout.tsx          # Layout sem sidebar (apenas logo)
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── secretaria/
│   │   │   └── page.tsx
│   │   ├── tesoureiro/
│   │   │   └── page.tsx
│   │   ├── conselheiro/
│   │   │   └── page.tsx
│   │   └── layout.tsx          # Layout com sidebar e header
│   └── page.tsx                # Redirect para login ou dashboard
├── lib/
│   └── supabase/
│       ├── client.ts           # Cliente browser
│       ├── server.ts           # Cliente server-side
│       └── middleware.ts       # Helpers para middleware
├── hooks/
│   └── use-auth.ts             # Hook de autenticação
├── types/
│   └── auth.ts                 # Tipos de autenticação
└── middleware.ts               # Middleware Next.js
```

## Configuração do Supabase

### Cliente Browser (client.ts)

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

### Cliente Server (server.ts)

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}
```

### Middleware (middleware.ts na raiz do src)

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isPublicRoute = request.nextUrl.pathname === "/";

  // Não logado tentando acessar área protegida
  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logado tentando acessar login
  if (user && isAuthRoute) {
    // Buscar papel do usuário e redirecionar
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("papel")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = getRedirectByRole(usuario?.papel);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

function getRedirectByRole(papel: string | undefined): string {
  const routes: Record<string, string> = {
    admin: "/admin",
    secretaria: "/secretaria",
    tesoureiro: "/tesoureiro",
    conselheiro: "/conselheiro",
  };
  return routes[papel || ""] || "/login";
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## Tipos (types/auth.ts)

```typescript
export type PapelUsuario =
  | "admin"
  | "secretaria"
  | "tesoureiro"
  | "conselheiro";

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  papel: PapelUsuario;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface AuthState {
  user: Usuario | null;
  loading: boolean;
  error: string | null;
}
```

## Hook useAuth (hooks/use-auth.ts)

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Usuario, PapelUsuario } from "@/types/auth";
import { useRouter } from "next/navigation";
import { snakeToCamel } from "@/lib/utils/case-converter";

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (data) {
          setUser(snakeToCamel<Usuario>(data));
        }
      }
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    if (data.user) {
      const { data: usuario } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (usuario) {
        setUser(snakeToCamel<Usuario>(usuario));
        router.push(getRedirectByRole(usuario.papel));
      }
    }

    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return { user, loading, signIn, signOut };
}

function getRedirectByRole(papel: PapelUsuario): string {
  const routes: Record<PapelUsuario, string> = {
    admin: "/admin",
    secretaria: "/secretaria",
    tesoureiro: "/tesoureiro",
    conselheiro: "/conselheiro",
  };
  return routes[papel];
}
```

## Página de Login

### Layout (app/(auth)/layout.tsx)

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo centralizado */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.png"
            alt="SGB - Borba Gato"
            className="h-32 w-auto"
          />
        </div>
        {children}
      </div>
    </div>
  )
}
```

### Página (app/(auth)/login/page.tsx)

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h1 className="text-2xl font-bold text-primary text-center mb-6">
        Entrar no SGB
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
```

## Rotas por Papel

| Papel       | Rota Base    | Acesso                 |
| ----------- | ------------ | ---------------------- |
| admin       | /admin       | Todas as rotas         |
| secretaria  | /secretaria  | Todas as rotas         |
| tesoureiro  | /tesoureiro  | Todas as rotas         |
| conselheiro | /conselheiro | Apenas /conselheiro/\* |

## Proteção de Rotas no Dashboard

O middleware já protege as rotas, mas para garantir acesso correto por papel, adicione verificação no layout do dashboard:

```typescript
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!usuario || !usuario.ativo) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar + Header + Content */}
      {children}
    </div>
  )
}
```

## Fluxo de Autenticação

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuário   │────▶│    Login    │────▶│  Supabase   │
│   acessa    │     │    Page     │     │    Auth     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Busca     │
                                        │   papel     │
                                        └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
             ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
             │   /admin    │           │ /secretaria │           │/conselheiro │
             └─────────────┘           └─────────────┘           └─────────────┘
```

## Criar Primeiro Usuário Admin

Após configurar o sistema, crie o primeiro admin via Supabase Dashboard:

1. Vá em Authentication > Users > Add User
2. Crie com email e senha
3. Copie o UUID do usuário criado
4. Vá em Table Editor > usuarios
5. Insira manualmente:

```sql
INSERT INTO usuarios (id, email, nome, papel, ativo)
VALUES (
  'uuid-do-usuario-criado',
  'admin@borbagato.com',
  'Administrador',
  'admin',
  true
);
```
