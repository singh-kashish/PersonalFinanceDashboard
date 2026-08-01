// src/features/auth/api/auth.api.ts
import axios from 'axios';
import { apiClient } from '@/lib/apiClient';
import type {
  MeResponseApi,
  RefreshResponseApi,
  SignupLoginResponseApi,
} from '../auth.types';

const API_URL = import.meta.env.VITE_API_URL;

// Using raw axios here for bootstrap, but returning .data consistently
export const refreshAccessToken = async (): Promise<RefreshResponseApi> => {
  const res = await axios.post<RefreshResponseApi>(
    `${API_URL}auth/refresh`,
    {},
    { withCredentials: true },
  );
  return res.data;
};

export const fetchMe = async (token: string): Promise<MeResponseApi> => {
  const res = await axios.get<MeResponseApi>(`${API_URL}auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// Normal API client for app calls
export const login = async (payload: { email: string; password: string }) => {
  const res = await apiClient.post<SignupLoginResponseApi>('/auth/login', payload);
  return res.data;
};

export const signup = async (payload: { email: string; password: string }) => {
  const res = await apiClient.post<SignupLoginResponseApi>('/auth/signup', payload);
  return res.data;
};

export const fetchMeUsingApiClient = async (token: string) => {
  const res = await apiClient.get<MeResponseApi>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
