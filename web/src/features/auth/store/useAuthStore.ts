// store/useAuthStore.ts
import { create } from "zustand";
import {
  type AuthState,
  type AuthStore,
  type User,
  type MeResponseApi,
  type RefreshResponseApi,
} from "../auth.types";
import {
  getAccessToken,
  setAccessToken,
  clearAccess,
} from "../AuthHelpers";
import { fetchMe, refreshAccessToken } from "../api/auth.api";

const getInitialState = (): AuthState => {
  const token = getAccessToken();
  return {
    user: null,
    accessToken: token ?? null,
    isAuthenticated: !!token,
    isBootstrapping: true,
  };
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...getInitialState(),

  setCredentials: ({ user, accessToken }) => {
    setAccessToken(accessToken);
    set(() => ({
      user,
      accessToken,
      isAuthenticated: true,
      isBootstrapping: false,
    }));
  },

  setZustandAccessToken: (token: string | null) => {
    set(() => ({
      accessToken: token,
      isAuthenticated: !!token,
    }));
  },

  logout: () => {
    clearAccess();
    set(() => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isBootstrapping: false,
    }));
  },

  finishBootstrap: () => {
    set((state) => ({
      ...state,
      isBootstrapping: false,
    }));
  },

  bootstrapAuthFlow: async () => {
    const token = get().accessToken;

    // 1. No access token at all → unauthenticated, done
    if (!token) {
      set(() => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isBootstrapping: false,
      }));
      return;
    }

    // Helper to set unauthenticated state (used in several places)
    const hardLogout = () => {
      clearAccess();
      set(() => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isBootstrapping: false,
      }));
    };

    // 2. Try /auth/me with current access token
    let meRes: MeResponseApi | null = null;

    try {
      const token = get().accessToken;
      if(!token)throw('No token')
      meRes = await fetchMe(token);
    } catch (err: any) {
      // Network / unexpected errors: safest is to treat as logged out
      hardLogout();
      return;
    }

    if (meRes.success) {
      // Token is valid, we have user
      const user: User = meRes.data.user;
      set(() => ({
        user,
        isAuthenticated: true,
        isBootstrapping: false,
      }));
      return;
    }

    // At this point, /auth/me returned { success: false, message: "Invalid or expired token" }

    // 3. Try /auth/refresh using cookie-based refresh token
    let refreshRes: RefreshResponseApi;

    try {
      refreshRes = await refreshAccessToken();
    } catch {
      hardLogout();
      return;
    }

    if (!refreshRes.success) {
      // Refresh failed → must log in again
      hardLogout();
      return;
    }

    const newToken = refreshRes.data.accessToken;

    // Save new token to localStorage and store
    setAccessToken(newToken);
    set(() => ({
      accessToken: newToken,
      isAuthenticated: true, // tentatively true
    }));

    // 4. Call /auth/me again with new token
    let meRes2: MeResponseApi;

    try {
      meRes2 = await fetchMe(newToken);
    } catch {
      hardLogout();
      return;
    }

    if (!meRes2.success) {
      // Even after refresh, token isn't usable → log out
      hardLogout();
      return;
    }

    const user: User = meRes2.data.user;
    set(() => ({
      user,
      isAuthenticated: true,
      isBootstrapping: false,
    }));
  },
}));
