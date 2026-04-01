export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
}

export type UserRole = 'Admin' | 'Viewer';

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactionsCount: number;
}
