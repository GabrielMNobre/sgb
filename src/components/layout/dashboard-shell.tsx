"use client";

import { useState } from "react";
import { Usuario } from "@/types/auth";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
  user: Usuario;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
