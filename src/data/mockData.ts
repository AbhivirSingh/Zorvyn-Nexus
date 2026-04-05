import type { Transaction, Category } from './types';

/** Generates a deterministic set of realistic Indian-context transactions */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

const MOCK_TRANSACTIONS: Transaction[] = [
  // ===== Income =====
  { id: generateId(), date: '2026-04-01', description: 'Monthly Salary - TCS', amount: 85000, category: 'Salary', type: 'income' },
  { id: generateId(), date: '2026-03-01', description: 'Monthly Salary - TCS', amount: 85000, category: 'Salary', type: 'income' },
  { id: generateId(), date: '2026-02-01', description: 'Monthly Salary - TCS', amount: 82000, category: 'Salary', type: 'income' },
  { id: generateId(), date: '2026-01-01', description: 'Monthly Salary - TCS', amount: 82000, category: 'Salary', type: 'income' },
  { id: generateId(), date: '2025-12-01', description: 'Monthly Salary - TCS', amount: 80000, category: 'Salary', type: 'income' },
  { id: generateId(), date: '2025-11-01', description: 'Monthly Salary - TCS', amount: 80000, category: 'Salary', type: 'income' },
  { id: generateId(), date: '2026-03-15', description: 'Freelance Web Dev - Upwork', amount: 25000, category: 'Freelance', type: 'income' },
  { id: generateId(), date: '2026-01-20', description: 'React Dashboard Project', amount: 18000, category: 'Freelance', type: 'income' },
  { id: generateId(), date: '2026-02-10', description: 'Logo Design - Fiverr', amount: 8000, category: 'Freelance', type: 'income' },
  { id: generateId(), date: '2026-04-02', description: 'Mutual Fund Returns', amount: 3200, category: 'Investment', type: 'income' },
  { id: generateId(), date: '2026-03-05', description: 'FD Interest - SBI', amount: 4500, category: 'Investment', type: 'income' },
  { id: generateId(), date: '2026-01-15', description: 'Stock Dividend - Reliance', amount: 2800, category: 'Investment', type: 'income' },

  // ===== Expenses =====
  { id: generateId(), date: '2026-04-03', description: 'Rent Payment - Hauz Khas', amount: 22000, category: 'Rent', type: 'expense' },
  { id: generateId(), date: '2026-03-03', description: 'Rent Payment - Hauz Khas', amount: 22000, category: 'Rent', type: 'expense' },
  { id: generateId(), date: '2026-02-03', description: 'Rent Payment - Hauz Khas', amount: 22000, category: 'Rent', type: 'expense' },
  { id: generateId(), date: '2026-01-03', description: 'Rent Payment - Hauz Khas', amount: 22000, category: 'Rent', type: 'expense' },
  { id: generateId(), date: '2025-12-03', description: 'Rent Payment - Hauz Khas', amount: 22000, category: 'Rent', type: 'expense' },
  { id: generateId(), date: '2025-11-03', description: 'Rent Payment - Hauz Khas', amount: 20000, category: 'Rent', type: 'expense' },

  { id: generateId(), date: '2026-04-04', description: 'Swiggy - Biryani Order', amount: 450, category: 'Food & Dining', type: 'expense' },
  { id: generateId(), date: '2026-04-02', description: 'Big Basket Groceries', amount: 3200, category: 'Food & Dining', type: 'expense' },
  { id: generateId(), date: '2026-03-28', description: 'Dinner at Farzi Café', amount: 2800, category: 'Food & Dining', type: 'expense' },
  { id: generateId(), date: '2026-03-20', description: 'Zomato - Weekly Meals', amount: 1600, category: 'Food & Dining', type: 'expense' },
  { id: generateId(), date: '2026-03-10', description: 'Grocery - DMart', amount: 4500, category: 'Food & Dining', type: 'expense' },
  { id: generateId(), date: '2026-02-15', description: 'Swiggy Orders', amount: 2200, category: 'Food & Dining', type: 'expense' },
  { id: generateId(), date: '2026-01-12', description: 'Monthly Groceries', amount: 5500, category: 'Food & Dining', type: 'expense' },

  { id: generateId(), date: '2026-03-22', description: 'Amazon - Headphones', amount: 4999, category: 'Shopping', type: 'expense' },
  { id: generateId(), date: '2026-02-14', description: 'Myntra - Winter Sale', amount: 3500, category: 'Shopping', type: 'expense' },
  { id: generateId(), date: '2026-01-26', description: 'Flipkart Republic Day Sale', amount: 8999, category: 'Shopping', type: 'expense' },
  { id: generateId(), date: '2025-12-15', description: 'Croma - Keyboard', amount: 2499, category: 'Shopping', type: 'expense' },

  { id: generateId(), date: '2026-04-01', description: 'Delhi Metro Card Recharge', amount: 500, category: 'Transport', type: 'expense' },
  { id: generateId(), date: '2026-03-18', description: 'Uber - Airport Trip', amount: 1200, category: 'Transport', type: 'expense' },
  { id: generateId(), date: '2026-02-20', description: 'Ola Rides - Monthly', amount: 2800, category: 'Transport', type: 'expense' },
  { id: generateId(), date: '2026-01-05', description: 'Rapido Bike Taxi', amount: 350, category: 'Transport', type: 'expense' },

  { id: generateId(), date: '2026-04-01', description: 'Electricity Bill - BSES', amount: 2400, category: 'Utilities', type: 'expense' },
  { id: generateId(), date: '2026-03-01', description: 'WiFi - Airtel', amount: 999, category: 'Utilities', type: 'expense' },
  { id: generateId(), date: '2026-03-05', description: 'Mobile Recharge - Jio', amount: 666, category: 'Utilities', type: 'expense' },
  { id: generateId(), date: '2026-02-01', description: 'Electricity Bill - BSES', amount: 1800, category: 'Utilities', type: 'expense' },

  { id: generateId(), date: '2026-03-12', description: 'Apollo Pharmacy', amount: 1200, category: 'Healthcare', type: 'expense' },
  { id: generateId(), date: '2026-01-25', description: 'Doctor Visit - Max Hospital', amount: 1500, category: 'Healthcare', type: 'expense' },

  { id: generateId(), date: '2026-02-05', description: 'Udemy - React Masterclass', amount: 499, category: 'Education', type: 'expense' },
  { id: generateId(), date: '2026-01-10', description: 'Coursera Subscription', amount: 3500, category: 'Education', type: 'expense' },

  { id: generateId(), date: '2026-03-30', description: 'Netflix Subscription', amount: 649, category: 'Entertainment', type: 'expense' },
  { id: generateId(), date: '2026-03-25', description: 'PVR Cinema - Dune 3', amount: 850, category: 'Entertainment', type: 'expense' },
  { id: generateId(), date: '2026-02-28', description: 'Spotify Premium', amount: 119, category: 'Entertainment', type: 'expense' },
  { id: generateId(), date: '2026-01-20', description: 'Book - Atomic Habits', amount: 350, category: 'Entertainment', type: 'expense' },

  { id: generateId(), date: '2026-03-08', description: 'Haircut - Naturals', amount: 500, category: 'Other', type: 'expense' },
  { id: generateId(), date: '2026-02-22', description: 'Laundry Service', amount: 800, category: 'Other', type: 'expense' },
];

export function getInitialTransactions(): Transaction[] {
  return MOCK_TRANSACTIONS.map(t => ({ ...t }));
}

/** Format INR with Indian numbering system */
export function formatINR(amount: number, compact = false): string {
  if (compact) {
    if (Math.abs(amount) >= 100000) {
      return '₹' + (amount / 100000).toFixed(1) + 'L';
    }
    if (Math.abs(amount) >= 1000) {
      return '₹' + (amount / 1000).toFixed(1) + 'K';
    }
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format date to human-readable */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}