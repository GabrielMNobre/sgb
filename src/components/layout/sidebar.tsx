"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  Award,
  ClipboardList,
  Link2,
  X,
  Building2,
  UserCog,
  BarChart3,
  ShoppingCart,
  CalendarDays,
  ShoppingBag,
  Heart,
  Wheat,
  Tent,
  CheckCircle2,
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

interface MenuItem {
  href: string;
  label: string;
  icon: typeof Home;
}

interface MenuSection {
  section: string | null;
  items: MenuItem[];
}

type MenuConfig = MenuItem[] | MenuSection[];

function isMenuSections(config: MenuConfig): config is MenuSection[] {
  return config.length > 0 && "section" in config[0];
}

const adminMenu: MenuSection[] = [
  {
    section: null,
    items: [{ href: "/admin", label: "Dashboard", icon: Home }],
  },
  {
    section: "Gestão",
    items: [
      { href: "/admin/membros", label: "Membros", icon: Users },
      { href: "/admin/unidades", label: "Unidades", icon: Building2 },
      { href: "/admin/conselheiros", label: "Conselheiros", icon: UserCog },
      // { href: "/admin/especialidades", label: "Especialidades", icon: Award }, // Temporariamente oculto
      { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
    ],
  },
  {
    section: "Encontros",
    items: [
      { href: "/admin/encontros", label: "Encontros", icon: Calendar },
      { href: "/admin/chamada", label: "Chamada", icon: ClipboardList },
      { href: "/admin/presencas", label: "Presenças", icon: CheckCircle2 },
    ],
  },
  {
    section: "Financeiro",
    items: [
      { href: "/admin/financeiro", label: "Dashboard", icon: DollarSign },
      { href: "/admin/financeiro/mensalidades", label: "Mensalidades", icon: DollarSign },
      { href: "/admin/financeiro/gastos", label: "Gastos", icon: ShoppingCart },
      { href: "/admin/financeiro/gastos/eventos", label: "Eventos", icon: CalendarDays },
      { href: "/admin/financeiro/acampamentos", label: "Acampamentos", icon: Tent },
    ],
  },
  {
    section: "Receitas",
    items: [
      { href: "/admin/financeiro/receitas/vendas", label: "Vendas", icon: ShoppingBag },
      { href: "/admin/financeiro/receitas/doacoes", label: "Doações", icon: Heart },
      { href: "/admin/financeiro/receitas/paes", label: "Pães", icon: Wheat },
    ],
  },
  {
    section: "Relatórios",
    items: [{ href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 }],
  },
];

const menuItems: Record<PapelUsuario, MenuConfig> = {
  admin: adminMenu,
  secretaria: [
    { href: "/secretaria", label: "Dashboard", icon: Home },
    { href: "/secretaria/membros", label: "Membros", icon: Users },
    { href: "/secretaria/unidades", label: "Unidades", icon: ClipboardList },
    { href: "/secretaria/conselheiros", label: "Conselheiros", icon: Link2 },
    // { href: "/secretaria/especialidades", label: "Especialidades", icon: Award }, // Temporariamente oculto
    // { href: "/secretaria/especialidades/conquistas", label: "Conquistas", icon: Award }, // Temporariamente oculto
    { href: "/secretaria/usuarios", label: "Usuários", icon: UserCog },
  ],
  tesoureiro: [
    {
      section: null,
      items: [{ href: "/tesoureiro", label: "Dashboard", icon: Home }],
    },
    {
      section: "Encontros",
      items: [
        { href: "/tesoureiro/presencas", label: "Presenças", icon: CheckCircle2 },
      ],
    },
    {
      section: "Financeiro",
      items: [
        { href: "/tesoureiro/mensalidades", label: "Mensalidades", icon: DollarSign },
        { href: "/tesoureiro/gastos", label: "Gastos", icon: ShoppingCart },
        { href: "/tesoureiro/gastos/eventos", label: "Eventos", icon: CalendarDays },
        { href: "/tesoureiro/acampamentos", label: "Acampamentos", icon: Tent },
      ],
    },
    {
      section: "Receitas",
      items: [
        { href: "/tesoureiro/receitas/vendas", label: "Vendas", icon: ShoppingBag },
        { href: "/tesoureiro/receitas/doacoes", label: "Doações", icon: Heart },
        { href: "/tesoureiro/receitas/paes", label: "Pães", icon: Wheat },
      ],
    },
  ],
  conselheiro: [
    {
      section: null,
      items: [{ href: "/conselheiro", label: "Dashboard", icon: Home }],
    },
    {
      section: "Minha Unidade",
      items: [
        { href: "/conselheiro/minha-unidade/membros", label: "Membros", icon: Users },
        { href: "/conselheiro/minha-unidade/historico", label: "Histórico", icon: BarChart3 },
      ],
    },
    {
      section: "Encontros",
      items: [
        { href: "/conselheiro/encontros", label: "Encontros", icon: Calendar },
        { href: "/conselheiro/chamada", label: "Chamada", icon: ClipboardList },
      ],
    },
    {
      section: "Financeiro",
      items: [
        { href: "/conselheiro/mensalidades", label: "Mensalidades", icon: DollarSign },
      ],
    },
  ],
};

function MenuItemLink({
  item,
  isActive,
  onClose,
}: {
  item: MenuItem;
  isActive: boolean;
  onClose?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-secondary text-primary font-medium"
          : "text-gray-200 hover:bg-white/10"
      )}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const config = menuItems[user.papel] || [];

  const renderMenu = () => {
    if (isMenuSections(config)) {
      return config.map((section, sectionIndex) => (
        <div key={sectionIndex} className={section.section ? "mt-4" : ""}>
          {section.section && (
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.section}
            </div>
          )}
          <div className="space-y-1">
            {section.items.map((item) => (
              <MenuItemLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      ));
    }

    return config.map((item) => (
      <MenuItemLink
        key={item.href}
        item={item}
        isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
        onClose={onClose}
      />
    ));
  };

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
          "fixed top-0 left-0 h-full w-64 bg-primary text-white z-50 transform transition-transform duration-200 lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
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
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {renderMenu()}
        </nav>

        {/* Footer com logout */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
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
