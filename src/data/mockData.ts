import type { Transaction, Category } from './types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './types';

/** Seeded PRNG for deterministic "random" mock data */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

let idCounter = 0;
function generateId(): string {
  return `tx_${(idCounter++).toString(36).padStart(6, '0')}`;
}

// ─── Expense templates for realistic descriptions ───
const EXPENSE_TEMPLATES: Record<string, { descriptions: string[]; range: [number, number] }> = {
  'Rent':           { descriptions: ['Rent Payment - Hauz Khas'], range: [20000, 22000] },
  'Food & Dining':  { descriptions: ['Swiggy Order', 'Big Basket Groceries', 'Zomato Delivery', 'Dinner at Farzi Café', 'DMart Run', 'Blinkit Groceries'], range: [300, 5500] },
  'Shopping':       { descriptions: ['Amazon Purchase', 'Myntra Sale', 'Flipkart Order', 'Croma Electronics', 'Ajio Fashion'], range: [500, 9000] },
  'Transport':      { descriptions: ['Metro Card Recharge', 'Uber Trip', 'Ola Ride', 'Rapido Bike Taxi', 'Petrol Fill-up'], range: [200, 3000] },
  'Utilities':      { descriptions: ['Electricity Bill - BSES', 'WiFi - Airtel', 'Mobile Recharge - Jio', 'Water Bill', 'Gas Bill'], range: [500, 2500] },
  'Healthcare':     { descriptions: ['Apollo Pharmacy', 'Doctor Visit - Max Hospital', 'Lab Tests - SRL', 'Dental Checkup'], range: [500, 3000] },
  'Education':      { descriptions: ['Udemy Course', 'Coursera Subscription', 'Book Purchase', 'Workshop Fee'], range: [300, 4000] },
  'Entertainment':  { descriptions: ['Netflix Subscription', 'PVR Cinema', 'Spotify Premium', 'Gaming Purchase', 'Concert Ticket'], range: [100, 2000] },
  'Other':          { descriptions: ['Haircut - Naturals', 'Laundry Service', 'Dry Cleaning', 'Gift Purchase', 'Charity Donation'], range: [200, 2000] },
};

const INCOME_TEMPLATES: Record<string, { descriptions: string[]; range: [number, number] }> = {
  'Salary':     { descriptions: ['Monthly Salary - TCS'], range: [78000, 86000] },
  'Freelance':  { descriptions: ['Freelance Web Dev - Upwork', 'React Project', 'Logo Design - Fiverr', 'UI Consulting'], range: [5000, 30000] },
  'Investment': { descriptions: ['Mutual Fund Returns', 'FD Interest - SBI', 'Stock Dividend', 'PPF Interest'], range: [1500, 6000] },
};

/**
 * Generates 10 months of high-fidelity mock transaction data.
 * Uses a seeded PRNG for deterministic output across app reloads.
 * 
 * Income follows a slight upward drift (salary raises).
 * Expenses follow a random walk with category-specific volatility.
 */
function generateMockTransactions(): Transaction[] {
  const rand = seededRandom(42);
  const transactions: Transaction[] = [];

  // 10 months: June 2025 → April 2026 (inclusive of partial April)
  const startMonth = new Date(2025, 5, 1); // June 2025
  const endDate = new Date(2026, 3, 5);    // April 5, 2026

  let currentDate = new Date(startMonth);

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const isPartialMonth = year === 2026 && month === 3; // April 2026 partial
    const lastDay = isPartialMonth ? 5 : daysInMonth;

    // ══ SALARY (1st of each month) ══
    const salaryBase = 78000 + Math.floor(((year - 2025) * 12 + month - 5) * 800); // Gentle raise over time
    const salaryVariation = Math.round((rand() - 0.5) * 4000);
    transactions.push({
      id: generateId(),
      date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
      description: 'Monthly Salary - TCS',
      amount: salaryBase + salaryVariation,
      category: 'Salary',
      type: 'income',
    });

    // ══ FREELANCE (0-2 per month, random days) ══
    const freelanceCount = rand() < 0.3 ? 0 : rand() < 0.6 ? 1 : 2;
    for (let f = 0; f < freelanceCount; f++) {
      const day = Math.min(Math.floor(rand() * lastDay) + 1, lastDay);
      const tmpl = INCOME_TEMPLATES['Freelance'];
      transactions.push({
        id: generateId(),
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        description: tmpl.descriptions[Math.floor(rand() * tmpl.descriptions.length)],
        amount: Math.round(tmpl.range[0] + rand() * (tmpl.range[1] - tmpl.range[0])),
        category: 'Freelance',
        type: 'income',
      });
    }

    // ══ INVESTMENT RETURNS (0-1 per month) ══
    if (rand() > 0.4) {
      const day = Math.min(Math.floor(rand() * lastDay) + 1, lastDay);
      const tmpl = INCOME_TEMPLATES['Investment'];
      transactions.push({
        id: generateId(),
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        description: tmpl.descriptions[Math.floor(rand() * tmpl.descriptions.length)],
        amount: Math.round(tmpl.range[0] + rand() * (tmpl.range[1] - tmpl.range[0])),
        category: 'Investment',
        type: 'income',
      });
    }

    // ══ EXPENSES ══
    // Rent — always on the 3rd
    if (3 <= lastDay) {
      transactions.push({
        id: generateId(),
        date: `${year}-${String(month + 1).padStart(2, '0')}-03`,
        description: 'Rent Payment - Hauz Khas',
        amount: 20000 + Math.round(rand() * 2000),
        category: 'Rent',
        type: 'expense',
      });
    }

    // Other expense categories — variable frequency
    const variableCategories: Category[] = ['Food & Dining', 'Shopping', 'Transport', 'Utilities', 'Healthcare', 'Education', 'Entertainment', 'Other'];
    const categoryFrequency: Record<string, number> = {
      'Food & Dining': 4, 'Shopping': 1.5, 'Transport': 2, 'Utilities': 1.5,
      'Healthcare': 0.5, 'Education': 0.4, 'Entertainment': 1.5, 'Other': 0.8,
    };

    for (const cat of variableCategories) {
      const avgCount = categoryFrequency[cat] || 1;
      // Scale down for partial months
      const scaledCount = isPartialMonth ? avgCount * (5 / 30) : avgCount;
      const count = Math.round(scaledCount + (rand() - 0.5) * avgCount * 0.6);
      
      for (let e = 0; e < Math.max(0, count); e++) {
        const day = Math.min(Math.floor(rand() * lastDay) + 1, lastDay);
        const tmpl = EXPENSE_TEMPLATES[cat];
        if (!tmpl) continue;
        
        // Random walk volatility: some months have spending spikes
        const volatilityMultiplier = 0.7 + rand() * 0.6; // 70%–130% of base
        const amount = Math.round((tmpl.range[0] + rand() * (tmpl.range[1] - tmpl.range[0])) * volatilityMultiplier);
        
        transactions.push({
          id: generateId(),
          date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          description: tmpl.descriptions[Math.floor(rand() * tmpl.descriptions.length)],
          amount,
          category: cat,
          type: 'expense',
        });
      }
    }

    // Advance to next month
    currentDate = new Date(year, month + 1, 1);
  }

  // Sort by date descending (newest first)
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return transactions;
}

const MOCK_TRANSACTIONS = generateMockTransactions();

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