// src/utils/networkStatus.ts
import { useErrorStore } from '@/features/error/useErrorStore';

/** True only when axios never got a response back (offline, DNS, timeout, server down, CORS). */
export const isNetworkError = (err: any): boolean => !err?.response;

/**
 * Call this from any catch block that just saw a network error.
 * If the browser thinks it's online, this is a *server* problem, not a
 * connectivity problem — surface it distinctly from 'network-offline',
 * which the online/offline listeners in RootComponent already own.
 */
export const reportIfServerUnreachable = (err: any): void => {
  if (isNetworkError(err) && navigator.onLine) {
    useErrorStore.getState().setGlobalError(
      'server-unreachable',
      'We can’t reach the Flo server right now. Please try again shortly.',
    );
  }
};

export const clearServerUnreachable = (): void => {
  const { globalErrorType, clearGlobalError } = useErrorStore.getState();
  if (globalErrorType === 'server-unreachable') {
    clearGlobalError();
  }
};