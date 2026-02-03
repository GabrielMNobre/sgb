"use client";

import { useState, useRef, useEffect } from "react";
import { User, ChevronDown, Settings } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { Usuario } from "@/types/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

interface UserMenuProps {
  user: Usuario;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fechar menu ao pressionar Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.nome}</p>
          <p className="text-xs text-gray-500">{ROLE_LABELS[user.papel]}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-500 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* Info do usuário no mobile */}
          <div className="md:hidden px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.nome}</p>
            <p className="text-xs text-gray-500">{ROLE_LABELS[user.papel]}</p>
          </div>

          {/* Opções do menu */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Navegar para configurações
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </button>
          </div>

          {/* Divisor */}
          <div className="border-t border-gray-100" />

          {/* Logout */}
          <div className="py-1">
            <LogoutButton variant="menu-item" />
          </div>
        </div>
      )}
    </div>
  );
}
