"use client";

import { Sidebar } from "@/components/layout/sidebar";

/**
 * Exemplo de uso da Sidebar Navigation
 * 
 * Este arquivo demonstra como integrar a Sidebar em diferentes contextos:
 * 1. Dashboard (sem groupId)
 * 2. Grupo tipo "pelada" (usuário membro)
 * 3. Grupo tipo "athletic" (usuário admin)
 */

// Exemplo 1: Dashboard (sem grupo específico)
export function SidebarDashboardExample() {
  return (
    <Sidebar
      // Sem groupId = mostra navegação geral
      notifications={3}
    />
  );
}

// Exemplo 2: Grupo tipo "pelada" (usuário membro)
export function SidebarPeladaExample() {
  return (
    <Sidebar
      groupId="123e4567-e89b-12d3-a456-426614174000"
      groupType="pelada"
      userRole="member"
      pendingPayments={2}
      notifications={1}
    />
  );
}

// Exemplo 3: Grupo tipo "athletic" (usuário admin)
export function SidebarAthleticExample() {
  return (
    <Sidebar
      groupId="987fcdeb-51a2-43f7-9876-543210fedcba"
      groupType="athletic"
      userRole="admin"
      pendingPayments={5}
      notifications={8}
    />
  );
}

// Exemplo 4: Layout com Sidebar
export function LayoutWithSidebar({
  children,
  groupId,
  groupType,
  userRole,
}: {
  children: React.ReactNode;
  groupId?: string;
  groupType?: "athletic" | "pelada";
  userRole?: "admin" | "member";
}) {
  return (
    <div className="flex h-screen">
      <Sidebar
        groupId={groupId}
        groupType={groupType}
        userRole={userRole}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}

