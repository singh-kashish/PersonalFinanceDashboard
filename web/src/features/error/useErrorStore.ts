// src/features/errors/useErrorStore.ts
import { create } from 'zustand';

export type GlobalErrorType = 'none' | 'network-offline' | 'server-unreachable';

interface ErrorState {
  globalErrorType: GlobalErrorType;
  message: string | null;
  setGlobalError: (type: GlobalErrorType, message?: string | null) => void;
  clearGlobalError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  globalErrorType: 'none',
  message: null,
  setGlobalError: (type, message = null) =>
    set(() => ({ globalErrorType: type, message })),
  clearGlobalError: () => set(() => ({ globalErrorType: 'none', message: null })),
}));
