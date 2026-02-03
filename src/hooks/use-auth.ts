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
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      return { error: getErrorMessage(error.message) };
    }

    if (data.user) {
      const { data: usuarioData } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", data.user.id)
        .single();

      const usuario = usuarioData as {
        ativo: boolean;
        papel: PapelUsuario;
      } | null;

      if (usuario) {
        if (!usuario.ativo) {
          await supabase.auth.signOut();
          setLoading(false);
          return { error: "Usuário inativo. Entre em contato com o administrador." };
        }

        setUser(snakeToCamel<Usuario>(usuarioData));
        router.push(getRedirectByRole(usuario.papel));
      } else {
        await supabase.auth.signOut();
        setLoading(false);
        return { error: "Usuário não encontrado no sistema." };
      }
    }

    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    }
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

function getErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    "Invalid login credentials": "Email ou senha incorretos.",
    "Email not confirmed": "Email não confirmado. Verifique sua caixa de entrada.",
    "Too many requests": "Muitas tentativas. Aguarde alguns minutos.",
  };
  return messages[error] || "Erro ao fazer login. Tente novamente.";
}
