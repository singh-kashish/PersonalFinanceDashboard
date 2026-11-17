// src/features/errors/ErrorLayout.tsx
import { type ReactNode } from 'react';
import { useErrorStore } from './useErrorStore';

interface ErrorLayoutProps {
  children: ReactNode;
}

export function ErrorLayout({ children }: ErrorLayoutProps) {
  const { globalErrorType, message } = useErrorStore();

  if (globalErrorType === 'network-offline') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-4">
        <h1 className="text-xl font-semibold mb-2">You’re offline</h1>
        <p className="text-sm text-slate-400 mb-4">
          {message || 'Check your internet connection and try again.'}
        </p>
      </main>
    );
  }

  if (globalErrorType === 'server-unreachable') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-4">
        <h1 className="text-xl font-semibold mb-2">Server isn’t reachable</h1>
        <p className="text-sm text-slate-400 mb-4">
          {message ||
            'We’re having trouble reaching the server. Please try again in a moment.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-md bg-emerald-500 px-4 py-1.5 text-sm font-medium text-slate-950 hover:bg-emerald-400"
        >
          Retry
        </button>
      </main>
    );
  }

  return <>{children}</>;
}
