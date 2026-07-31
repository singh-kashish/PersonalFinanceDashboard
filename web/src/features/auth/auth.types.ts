// types/auth.ts
import type { AxiosRequestConfig } from 'axios';

export type User = {
  id: number;
  email: string;
  name: string | null;
};

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
}

export interface AuthStore extends AuthState {
  setCredentials: (payload: { user: User; accessToken: string }) => void;
  setZustandAccessToken: (accessToken: string | null) => void;
  logout: () => void;
  finishBootstrap: () => void;
  bootstrapAuthFlow: () => Promise<void>;
}

// Exact backend responses (all with same user shape now)
export interface AuthUserApi {
  id: number;
  email: string;
  name: string | null;
}

export interface SignupLoginResponseApi {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: AuthUserApi;
  };
}

export interface MeResponseApi {
  success: boolean;
  message: string;
  data: {
    user: AuthUserApi;
  };
}

export interface RefreshResponseApi {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}
