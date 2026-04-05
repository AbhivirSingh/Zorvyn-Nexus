export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Rent'
  | 'Food & Dining'
  | 'Shopping'
  | 'Transport'
  | 'Utilities'
  | 'Healthcare'
  | 'Education'
  | 'Entertainment'
  | 'Other';

export const INCOME_CATEGORIES: Category[] = ['Salary', 'Freelance', 'Investment'];
export const EXPENSE_CATEGORIES: Category[] = [
  'Rent', 'Food & Dining', 'Shopping', 'Transport',
  'Utilities', 'Healthcare', 'Education', 'Entertainment', 'Other'
];
export const ALL_CATEGORIES: Category[] = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export interface Transaction {
  id: string;
  date: string;       // ISO date string
  description: string;
  amount: number;      // Always positive; type indicates direction
  category: Category;
  type: TransactionType;
}

export type Role = 'admin' | 'viewer';

export interface FinancialMetrics {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  avgMonthlyExpense: number;
  healthScore: number;
}

export interface MonthlyData {
  month: string;       // "Jan", "Feb", etc.
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  dismissed: boolean;
}

/** Category → color map for charts (teal-derived palette) */
export const CATEGORY_COLORS: Record<Category, string> = {
  Salary: '#06b6d4',
  Freelance: '#3b82f6',
  Investment: '#8b5cf6',
  Rent: '#ef4444',
  'Food & Dining': '#f97316',
  Shopping: '#eab308',
  Transport: '#14b8a6',
  Utilities: '#6366f1',
  Healthcare: '#ec4899',
  Education: '#10b981',
  Entertainment: '#a855f7',
  Other: '#6b7280',
};

/** Category → icon name map (Lucide icon names) */
export const CATEGORY_ICONS: Record<Category, string> = {
  Salary: 'briefcase',
  Freelance: 'laptop',
  Investment: 'trending-up',
  Rent: 'home',
  'Food & Dining': 'utensils',
  Shopping: 'shopping-bag',
  Transport: 'car',
  Utilities: 'zap',
  Healthcare: 'heart-pulse',
  Education: 'graduation-cap',
  Entertainment: 'gamepad-2',
  Other: 'circle-dot',
};