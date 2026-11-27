export type TransactionType = 'INCOME' | 'EXPENSE'

export type Transaction = {
  id: number;
  amount: string; // API returns string with 2 decimals
  type: TransactionType;
  category: string | null;
  description: string | null;
  date: string;        // ISO string from API
  userId: number;
  createdAt: string;   // ISO string
  updatedAt: string;   // ISO string
};

/** Transaction with numeric amount for chart libraries */
export type ChartTransaction = {
  id: number;
  amount: number;
  type: TransactionType;
  category: string | null;
  description: string | null;
  date: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type TransactionsPagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type GetTransactionsResponse = {
  transactions: Transaction[];
  pagination: TransactionsPagination;
};
