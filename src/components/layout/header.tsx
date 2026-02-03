import { Usuario } from "@/types/auth";
import { UserMenu } from "./user-menu";
import { Menu } from "lucide-react";

interface HeaderProps {
  user: Usuario;
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      {/* Botão menu mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu className="h-6 w-6 text-gray-600" />
      </button>

      {/* Título da página - pode ser dinâmico */}
      <div className="hidden lg:block">
        <h1 className="text-lg font-semibold text-gray-900">
          Sistema de Gestão do Borba
        </h1>
      </div>

      {/* Logo mobile */}
      <div className="lg:hidden">
        <span className="text-lg font-bold text-primary">SGB</span>
      </div>

      {/* Menu do usuário */}
      <UserMenu user={user} />
    </header>
  );
}
