'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <Sidebar className="h-screen" />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <Topbar />

        <div className="px-4 pt-4 md:px-6 lg:px-8">
          <Breadcrumbs />
        </div>

        <main className="flex-1 px-4 pb-8 md:px-6 lg:px-8">
          <div className="brand-panel min-h-[calc(100vh-170px)] p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
