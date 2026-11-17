// Token-attaching client + a single-flight token refresh mechanism with a retry queue for failed 401s
import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getAccessToken, clearAccess } from '@/features/auth/AuthHelpers';
import { refreshQueue } from '@/utils/refreshQueue';
import { refreshAccessToken } from '@/features/auth/api/auth.api';
import type { RefreshResponseApi } from '@/features/auth/auth.types';
import { isNetworkError, reportIfServerUnreachable, clearServerUnreachable } from '@/utils/networkStatus';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface RetriableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // A successful response is proof the server is reachable again.
    clearServerUnreachable();
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: RetriableRequestConfig = error.config as RetriableRequestConfig;

    // No response at all: surface it, don't touch auth state, bail immediately.
    // (This deliberately does NOT enter the 401/refresh path below.)
    if (isNetworkError(error)) {
      reportIfServerUnreachable(error);
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = originalRequest?.url ?? '';
    const isRefreshCall = url.includes('/auth/refresh');

    if (status !== 401 || originalRequest._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    if (refreshQueue.isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest._retry = true;
          originalRequest.headers = originalRequest.headers ?? {};
          (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    refreshQueue.setRefreshing(true);

    try {
      const refreshRes: RefreshResponseApi = await refreshAccessToken();
      const newAccessToken = refreshRes.data.accessToken;

      refreshQueue.process(newAccessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError: any) {
      
      refreshQueue.process(null);
      
      if (isNetworkError(refreshError)) {
        // Refresh itself couldn't reach the server — not proof the session
        // is dead. Leave the token alone.
        reportIfServerUnreachable(refreshError);
      } else if(refreshError.response?.status===401 || refreshError.response?.status === 403){
        const { logout } = useAuthStore.getState();
        logout();
      }else {
       reportIfServerUnreachable(refreshError);
       return Promise.reject(refreshError);
      }

      return Promise.reject(refreshError);
    } finally {
      refreshQueue.setRefreshing(false);
    }
  },
);