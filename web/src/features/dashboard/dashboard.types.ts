export type TransactionType = 'INCOME' | 'EXPENSE'

export type Transaction = {
  id: number;
  amount: string; // or number, depending on how you serialize decimals
  type: TransactionType;
  category: string;
  description: string | null;
  date: string;        // ISO string from API
  userId: number;
  createdAt: string;   // ISO string
  updatedAt: string;   // ISO string
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
