import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/login");
  const isPublicRoute = pathname === "/" || pathname.startsWith("/api");

  // Não logado tentando acessar área protegida
  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logado tentando acessar login - redireciona para dashboard
  if (user && isAuthRoute) {
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
