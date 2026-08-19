import { apiClient } from '@/lib/apiClient';
import type { MonthlySummaryInput } from '../dashboard.types';
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

export const getMonthlySummary = async({from,to}:MonthlySummaryInput): Promise<> =>{
    const res = apiClient.get(
        `{API_URL}/analytics/summary`,
        {from,to},
        {withCredentials: true},
    );
    return res.
}