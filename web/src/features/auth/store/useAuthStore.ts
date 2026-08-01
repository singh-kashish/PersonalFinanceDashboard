// src/features/auth/store/useAuthStore.ts
import { create } from 'zustand';
import {
  type AuthState,
  type AuthStore,
  type User,
  type RefreshResponseApi,
} from '../auth.types';
import { getAccessToken, setAccessToken, clearAccess } from '../AuthHelpers';
import { fetchMe, refreshAccessToken } from '../api/auth.api';
import { isNetworkError, reportIfServerUnreachable } from '@/utils/networkStatus';

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
    set((state) => ({ ...state, isBootstrapping: false }));
  },

  bootstrapAuthFlow: async () => {
    const existingToken = get().accessToken;

    // 1. No token at all → definitively logged out. Nothing to verify.
    if (!existingToken) {
      set(() => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isBootstrapping: false,
      }));
      return;
    }

    const hardLogout = () => {
      clearAccess();
      set(() => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isBootstrapping: false,
      }));
    };

    // Server never confirmed OR denied anything — leave token/user untouched,
    // just stop showing the boot spinner so the UI (ErrorLayout) can react.
    const staleNetwork = (err: any) => {
      reportIfServerUnreachable(err);
      set((state) => ({ ...state, isBootstrapping: false }));
    };

    const tryRefreshAndRehydrate = async () => {
      let refreshRes: RefreshResponseApi;

      try {
        refreshRes = await refreshAccessToken();
      } catch (err: any) {
        if (isNetworkError(err)) {
          staleNetwork(err);
          return;
        }
        // Server responded and said the refresh token is bad/expired.
        hardLogout();
        return;
      }

      if (!refreshRes.success) {
        hardLogout();
        return;
      }

      const newToken = refreshRes.data.accessToken;
      setAccessToken(newToken);
      set(() => ({ accessToken: newToken, isAuthenticated: true }));

      try {
        const meRes2 = await fetchMe(newToken);
        set(() => ({
          user: meRes2.data.user as User,
          isAuthenticated: true,
          isBootstrapping: false,
        }));
      } catch (err: any) {
        if (isNetworkError(err)) {
          staleNetwork(err);
          return;
        }
        // Brand-new access token got rejected immediately — treat as a real
        // auth failure rather than looping.
        hardLogout();
      }
    };

    // 2. Verify the existing access token against /auth/me.
    try {
      const meRes = await fetchMe(existingToken);
      set(() => ({
        user: meRes.data.user as User,
        isAuthenticated: true,
        isBootstrapping: false,
      }));
      return;
    } catch (err: any) {
      if (isNetworkError(err)) {
        // Offline, DNS failure, server down, CORS — server said nothing.
        // Never log the user out for this.
        staleNetwork(err);
        return;
      }

      const status = err?.response?.status;
      if (status === 401) {
        // Server explicitly rejected the access token — try to refresh.
        await tryRefreshAndRehydrate();
        return;
      }

      // Any other real response (500, etc.) is a server problem, not proof
      // the session is invalid. Don't log out over it.
      staleNetwork(err);
    }
  },
}));