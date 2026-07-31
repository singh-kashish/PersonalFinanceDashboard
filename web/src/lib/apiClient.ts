// src/api/client.ts
// Token-attaching client + a single-flight token refresh mechanism with a retry queue for failed 401s
import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, clearAccess } from "@/features/auth/AuthHelpers";
import { refreshQueue } from "@/utils/refreshQueue";
import { refreshAccessToken } from "@/features/auth/api/auth.api";

interface RetriableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token to every request header, return config for axios to proceed
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest:any = error.config as RetriableRequestConfig;
    const status = error.response?.status;
    const url = originalRequest?.url as string | undefined;
    const isRefreshCall = url?.includes("/auth/refresh");

    // Only handle 401s for non-refresh requests, once
    if (status !== 401 || originalRequest._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    if(refreshQueue.isRefreshing){
      return new Promise((resolve,reject)=>{
        refreshQueue.push((newToken)=>{
          if(!newToken){
            reject(error);
            return;
          }
          originalRequest._retry = true;
          originalRequest.headers = originalRequest.headers ?? {};
          (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;

          resolve(apiClient(originalRequest));
        })
      })
    }

    // First 401: perform refresh
    originalRequest._retry = true;
    refreshQueue.setRefreshing(true);

    try{
      const newToken = await refreshAccessToken();
      refreshQueue.process(newToken.data.accessToken);
      originalRequest.headers = originalRequest.headers ?? {};
      (originalRequest.headers as any).Authorization = `Bearer ${newToken.data.accessToken}`;

      return apiClient(originalRequest);
    } catch(refreshError){
      refreshQueue.process(null);
      clearAccess();
      return Promise.reject(refreshError);
    } finally{
      refreshQueue.setRefreshing(false);
    }
    
  }
);
