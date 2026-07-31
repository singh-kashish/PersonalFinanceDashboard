// AppShell.tsx
import { Outlet, useRouterState } from '@tanstack/react-router';
import Header from './Header';
import { AsideNav } from './AsideNav';

export type Section = 'dashboard' | 'analytics' | 'transactions' | 'settings';

function getActiveSection(pathname: string): Section {
  if (pathname === '/' || pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/analytics')) return 'analytics';
  if (pathname.startsWith('/transactions')) return 'transactions';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'dashboard'; // fallback
}

export function AppShell() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const activeSection = getActiveSection(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-50">
      <Header />

      {/* Desktop: aside left, content right; Mobile: content then bottom nav */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Main content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>

        {/* Desktop aside */}
        <aside className="hidden md:flex md:w-56 border-l border-slate-800 flex-col py-4">
          <AsideNav activeSection={activeSection} />
        </aside>

        {/* Mobile bottom nav */}
        <nav className="md:hidden border-t border-slate-800">
          <AsideNav activeSection={activeSection} />
        </nav>
      </div>
    </div>
  );
}




