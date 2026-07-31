// src/features/auth/components/AuthShell.tsx
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { useAuthStore } from '../store/useAuthStore';
import { FloLoginPage } from './AuthCard';
import { SquareSpin } from '@/components/ui/square-spin';
import Dashboard from '@/features/dashboard/components/Dashboard'; // whatever your dashboard root is

interface AuthShellProps {
  children: ReactNode; 
}

export function AuthShell({ children }: AuthShellProps) {
  const router = useRouter();
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const { isBootstrapping, isAuthenticated } = useAuthStore();


  useEffect(() => {
    if (isBootstrapping) return;

    if (!isAuthenticated && pathname !== '/') {
      router.navigate({ to: '/', replace: true });
      return;
    }

    if (isAuthenticated && pathname === '/') {
      router.navigate({ to: '/dashboard' , replace: true });
    }
  }, [isBootstrapping, isAuthenticated, pathname, router]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <SquareSpin size="xl" className="bg-emerald-700!" />
      </div>
    );
  }

  // 2. Unauthenticated:
  //    - URL has already been normalized to '/'
  //    - Show login/signup instead of any route content
  if (!isAuthenticated) {
    return (
      <main className="min-h-dvh w-full flex items-center justify-center bg-background">
        <FloLoginPage/>
      </main>
    );
  }

  // 3. Authenticated:
  //    - If URL is '/', effect will have redirected to '/dashboard'
  //    - For '/dashboard' and all other valid routes, just render router content
  //    - For 404s, root notFoundComponent will show inside this shell
  if (pathname === '/') {
    // Very short-lived state while effect runs; render dashboard here as a fallback
    return <Dashboard />;
  }

  return <>{children}</>;
}
