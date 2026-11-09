import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '@/components/CommandPalette';
import { Skeleton } from '@/components/ui/Skeleton';

function ChargementPage() {
  return (
    <div className="flex flex-col gap-3.5" aria-busy="true" aria-label="Chargement de la page">
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[150px] rounded-card" />
        ))}
      </div>
      <Skeleton className="h-[430px] rounded-card" />
    </div>
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen p-0 sm:p-3 lg:p-5">
      <div className="shell mx-auto flex min-h-screen w-full max-w-[1560px] overflow-hidden rounded-none p-0 sm:min-h-[calc(100vh-24px)] sm:rounded-shell lg:min-h-[calc(100vh-40px)] lg:p-2">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
          <Header />
          <main
            id="contenu"
            tabIndex={-1}
            className="flex-1 px-3 pb-6 pt-3 outline-none lg:px-4 lg:pb-4"
          >
            <Suspense fallback={<ChargementPage />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
      <MobileNav />
      <CommandPalette />
    </div>
  );
}
