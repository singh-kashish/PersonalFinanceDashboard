// src/features/auth/AuthHelpers.ts
export const getAccessToken = (): string | null =>
  typeof window === 'undefined' ? null : localStorage.getItem('accessToken');

export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
};

export const clearAccess = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
}
