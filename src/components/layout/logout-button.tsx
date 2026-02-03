"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

interface LogoutButtonProps {
  variant?: "button" | "menu-item";
  className?: string;
}

export function LogoutButton({
  variant = "button",
  className,
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);

    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "menu-item") {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50",
          className,
        )}
      >
        <LogOut className="h-4 w-4" />
        {loading ? "Saindo..." : "Sair"}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50",
        className,
      )}
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
