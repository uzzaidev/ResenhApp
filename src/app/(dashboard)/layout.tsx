'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { useDirectMode } from '@/contexts/direct-mode-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDirectMode } = useDirectMode();

  // Se estiver em modo direto, renderizar layout simplificado
  if (isDirectMode) {
    return (
      <div className="min-h-screen">
        {/* Topbar minimalista para modo direto */}
        <Topbar />
        {/* Conteúdo direto sem sidebar */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    );
  }

  // Layout normal
  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-[280px]">
        {/* Topbar - Sticky */}
        <Topbar />

        {/* Breadcrumbs */}
        <div className="px-4 md:px-6 lg:px-8 pt-4">
          <Breadcrumbs />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
