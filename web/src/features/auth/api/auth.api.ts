// src/features/auth/api/auth.api.ts
import { apiClient } from '@/lib/apiClient';
import axios from "axios";
import type { MeResponseApi, RefreshResponseApi, SignupLoginResponseApi, } from "../auth.types";

const API_URL = import.meta.env.VITE_API_URL;

export const refreshAccessToken = async () => {
  const response:RefreshResponseApi = await axios.post(
    `${API_URL}auth/refresh`,
    {},
    { withCredentials: true }
  );
  return response;
};

export const fetchMe = async (token: string) => {
  const response : MeResponseApi = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return response;
};




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

