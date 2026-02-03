"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Award,
  ClipboardList,
  X,
} from "lucide-react";
import { Usuario, PapelUsuario } from "@/types/auth";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils/cn";
import { ROLE_LABELS } from "@/lib/constants";

interface SidebarProps {
  user: Usuario;
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems: Record<
  PapelUsuario,
  Array<{ href: string; label: string; icon: typeof Home }>
> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/encontros", label: "Encontros", icon: Calendar },
    { href: "/admin/relatorios", label: "Relatórios", icon: FileText },
  ],
  secretaria: [
    { href: "/secretaria", label: "Dashboard", icon: Home },
    { href: "/secretaria/membros", label: "Membros", icon: Users },
    { href: "/secretaria/unidades", label: "Unidades", icon: ClipboardList },
    { href: "/secretaria/especialidades", label: "Especialidades", icon: Award },
  ],
  tesoureiro: [
    { href: "/tesoureiro", label: "Dashboard", icon: Home },
    { href: "/tesoureiro/mensalidades", label: "Mensalidades", icon: DollarSign },
  ],
  conselheiro: [
    { href: "/conselheiro", label: "Dashboard", icon: Home },
    { href: "/conselheiro/minha-unidade", label: "Minha Unidade", icon: Users },
    { href: "/conselheiro/chamada", label: "Chamada", icon: ClipboardList },
  ],
};

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = menuItems[user.papel] || [];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-primary text-white z-50 transform transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SGB"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div>
              <span className="font-bold text-lg">SGB</span>
              <p className="text-xs text-gray-300">{ROLE_LABELS[user.papel]}</p>
            </div>
          </div>

          {/* Botão fechar mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-secondary text-primary font-medium"
                    : "text-gray-200 hover:bg-white/10",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer com logout */}
        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium">{user.nome}</p>
            <p className="text-xs text-gray-300">{user.email}</p>
          </div>
          <LogoutButton
            variant="button"
            className="w-full justify-center bg-white/10 hover:bg-red-600 text-white hover:text-white"
          />
        </div>
      </aside>
    </>
  );
}
