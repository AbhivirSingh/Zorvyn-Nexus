import { create } from 'zustand';
import type { Transaction, Role, Category, Alert, TransactionType } from '../data/types';
import { getInitialTransactions } from '../data/mockData';

/* ============================================================
   ZUSTAND STORE — Slice-based architecture
   Each slice handles a single concern. Combined into one store
   for cross-slice selectors (e.g., metrics derived from transactions).
   ============================================================ */

// ===== Transaction Slice =====
interface TransactionSlice {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  resetTransactions: () => void;
}

// ===== Role Slice =====
interface RoleSlice {
  role: Role;
  setRole: (role: Role) => void;
}

// ===== UI Slice =====
interface UISlice {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  notificationPanelOpen: boolean;
  setNotificationPanelOpen: (open: boolean) => void;
}

// ===== Alert Slice =====
interface AlertSlice {
  alerts: Alert[];
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
}

// ===== Filter Slice =====
interface FilterSlice {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: Category | 'all';
  setFilterCategory: (cat: Category | 'all') => void;
  filterType: TransactionType | 'all';
  setFilterType: (type: TransactionType | 'all') => void;
  sortBy: 'date' | 'amount';
  setSortBy: (sort: 'date' | 'amount') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (dir: 'asc' | 'desc') => void;
}

// ===== Combined Store =====
type Store = TransactionSlice & RoleSlice & UISlice & AlertSlice & FilterSlice;

/** Detect system dark mode preference */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'dark'; // Default to dark for fintech dashboard feel
}

export const useStore = create<Store>((set, get) => ({
  // ===== Transactions =====
  transactions: getInitialTransactions(),

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [
        { ...tx, id: Math.random().toString(36).substring(2, 11) },
        ...state.transactions,
      ],
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  resetTransactions: () => set({ transactions: getInitialTransactions() }),

  // ===== Role =====
  role: 'admin',
  setRole: (role) => set({ role }),

  // ===== UI =====
  theme: getSystemTheme(),
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    // Add transition class for smooth theme switch
    document.documentElement.classList.add('transitioning');
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setTimeout(() => document.documentElement.classList.remove('transitioning'), 350);
    set({ theme: next });
  },
  setTheme: (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  notificationPanelOpen: false,
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),

  // ===== Alerts =====
  alerts: [],
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, dismissed: true } : a
      ),
    })),
  clearAlerts: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, dismissed: true })),
    })),

  // ===== Filters =====
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filterCategory: 'all',
  setFilterCategory: (cat) => set({ filterCategory: cat }),
  filterType: 'all',
  setFilterType: (type) => set({ filterType: type }),
  sortBy: 'date',
  setSortBy: (sort) => set({ sortBy: sort }),
  sortDirection: 'desc',
  setSortDirection: (dir) => set({ sortDirection: dir }),
}));