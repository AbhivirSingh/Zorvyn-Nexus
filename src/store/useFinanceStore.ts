import { create } from 'zustand';
import type { Transaction, UserRole } from '../types/finance';
import { mockTransactions } from '../lib/mock-data';

export interface FilterState {
  search: string;
  category: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

interface FinanceStore {
  transactions: Transaction[];
  role: UserRole;
  filters: FilterState;
  setRole: (role: UserRole) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  addTransaction: (transaction: Transaction) => void;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: mockTransactions,
  role: 'Admin',
  filters: {
    search: '',
    category: '',
    dateRange: { start: null, end: null },
  },
  setRole: (role) => set({ role }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  addTransaction: (transaction) => set((state) => ({ 
    transactions: [transaction, ...state.transactions] 
  })),
}));
