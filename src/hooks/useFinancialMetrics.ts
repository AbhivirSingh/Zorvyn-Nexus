import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { FinancialMetrics, MonthlyData, CategoryBreakdown, Transaction, TimeSeriesPoint } from '../data/types';
import { CATEGORY_COLORS } from '../data/types';

/**
 * Computes all financial KPIs from the transaction list.
 * Memoized to avoid recalculation on unrelated state changes.
 */
export function useFinancialMetrics(customTransactions?: Transaction[]): FinancialMetrics {
  const allTransactions = useStore((s) => s.transactions);
  const transactions = customTransactions || allTransactions;

  return useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Count unique months with expenses
    const monthsWithExpenses = new Set(
      transactions.filter((t) => t.type === 'expense').map((t) => t.date.substring(0, 7))
    ).size;
    const avgMonthlyExpense = monthsWithExpenses > 0 ? totalExpenses / monthsWithExpenses : 0;

    // Health score: weighted formula (0-100) with realistic variance
    // Components: savings discipline, spending consistency, diversity, balance trend, volatility penalty

    // 1. Savings discipline (max 30 pts) — less generous cap
    const savingsScore = Math.min(savingsRate / 40 * 25, 30); // Need 40%+ savings for full marks

    // 2. Spending consistency (max 20 pts) — penalize erratic spending
    const monthlyExpenses = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const key = t.date.substring(0, 7);
      monthlyExpenses.set(key, (monthlyExpenses.get(key) || 0) + t.amount);
    });
    const expenseAmounts = Array.from(monthlyExpenses.values());
    const avgExp = expenseAmounts.length > 0 ? expenseAmounts.reduce((a, b) => a + b, 0) / expenseAmounts.length : 0;
    const variance = expenseAmounts.length > 1
      ? Math.sqrt(expenseAmounts.reduce((s, v) => s + Math.pow(v - avgExp, 2), 0) / expenseAmounts.length) / (avgExp || 1)
      : 0;
    // Low variance (< 0.15) = high consistency. High variance = penalty
    const consistencyScore = Math.max(0, 20 - variance * 40);

    // 3. Category diversity (max 15 pts)
    const categories = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));
    const diversityScore = Math.min(categories.size * 2, 15);

    // 4. Positive balance trend (max 15 pts)
    const balanceScore = totalBalance > 0 ? Math.min(totalBalance / totalIncome * 30, 15) : 0;

    // 5. Spending concentration penalty (0 to -10 pts)
    // If one category > 40% of expenses, deduct points
    const catTotals = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catTotals.set(t.category, (catTotals.get(t.category) || 0) + t.amount);
    });
    const maxCatPct = totalExpenses > 0 ? Math.max(...Array.from(catTotals.values())) / totalExpenses * 100 : 0;
    const concentrationPenalty = maxCatPct > 40 ? Math.min((maxCatPct - 40) * 0.3, 10) : 0;

    const healthScore = Math.round(
      Math.max(0, Math.min(savingsScore + consistencyScore + diversityScore + balanceScore - concentrationPenalty, 100))
    );

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      savingsRate: Math.round(savingsRate * 10) / 10,
      avgMonthlyExpense: Math.round(avgMonthlyExpense),
      healthScore,
    };
  }, [transactions]);
}

/**
 * Adaptive Time-Series Aggregator.
 * Dynamically bins transaction data into days, weeks, months, or years
 * based on the span of the provided transaction date range.
 *
 * Tick intervals:
 *   ≤20 days   → Daily   (e.g., "Mon 01", "Tue 02")
 *   ≤5 months  → Weekly  (e.g., "Week 1 (Mar)", "Week 2 (Mar)")
 *   ≤4 years   → Monthly (e.g., "Jan '26", "Feb '26")
 *   >4 years   → Yearly  (e.g., "2025", "2026")
 */
export type TimeScale = 'day' | 'week' | 'month' | 'year';

function detectTimeScale(transactions: Transaction[]): { scale: TimeScale; minDate: Date; maxDate: Date } {
  if (transactions.length === 0) {
    const now = new Date(2026, 3, 5);
    return { scale: 'month', minDate: now, maxDate: now };
  }

  const dates = transactions.map(t => new Date(t.date).getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const spanDays = Math.max(1, Math.round((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));

  let scale: TimeScale;
  if (spanDays <= 20) scale = 'day';
  else if (spanDays <= 150) scale = 'week'; // ~5 months
  else if (spanDays <= 1460) scale = 'month'; // ~4 years
  else scale = 'year';

  return { scale, minDate, maxDate };
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getBinKey(date: Date, scale: TimeScale): string {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  switch (scale) {
    case 'day':
      return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    case 'week': {
      // ISO week-based: group by the Monday of each week
      const dayOfWeek = date.getDay(); // 0=Sun
      const monday = new Date(y, m, d - ((dayOfWeek + 6) % 7));
      return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    }
    case 'month':
      return `${y}-${String(m + 1).padStart(2, '0')}`;
    case 'year':
      return `${y}`;
  }
}

function getBinLabel(key: string, scale: TimeScale): string {
  switch (scale) {
    case 'day': {
      const d = new Date(key + 'T00:00:00');
      return `${DAYS_SHORT[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}`;
    }
    case 'week': {
      const d = new Date(key + 'T00:00:00');
      // Calculate which week of the month this is (1-based)
      const weekNum = Math.ceil(d.getDate() / 7);
      return `Wk ${weekNum} (${MONTHS_SHORT[d.getMonth()]})`;
    }
    case 'month': {
      const [y, mStr] = key.split('-');
      const m = parseInt(mStr) - 1;
      return `${MONTHS_SHORT[m]} '${y.slice(2)}`;
    }
    case 'year':
      return key;
  }
}

function generateBinKeys(minDate: Date, maxDate: Date, scale: TimeScale): string[] {
  const keys: string[] = [];
  const cursor = new Date(minDate);

  // Align cursor to the start of its bin
  if (scale === 'day') {
    cursor.setHours(0, 0, 0, 0);
  } else if (scale === 'week') {
    const dayOfWeek = cursor.getDay();
    cursor.setDate(cursor.getDate() - ((dayOfWeek + 6) % 7));
  } else if (scale === 'month') {
    cursor.setDate(1);
  } else if (scale === 'year') {
    cursor.setMonth(0, 1);
  }

  while (cursor <= maxDate) {
    keys.push(getBinKey(cursor, scale));

    // Advance cursor
    if (scale === 'day') cursor.setDate(cursor.getDate() + 1);
    else if (scale === 'week') cursor.setDate(cursor.getDate() + 7);
    else if (scale === 'month') cursor.setMonth(cursor.getMonth() + 1);
    else if (scale === 'year') cursor.setFullYear(cursor.getFullYear() + 1);
  }

  // Deduplicate (week bins can overlap at boundaries)
  return [...new Set(keys)];
}

export function useTimeSeriesData(customTransactions?: Transaction[]): TimeSeriesPoint[] {
  const allTransactions = useStore((s) => s.transactions);
  const transactions = customTransactions || allTransactions;

  return useMemo(() => {
    if (transactions.length === 0) return [];

    const { scale, minDate, maxDate } = detectTimeScale(transactions);
    const binKeys = generateBinKeys(minDate, maxDate, scale);

    // Initialize bins
    const bins = new Map<string, { income: number; expenses: number }>();
    for (const key of binKeys) {
      bins.set(key, { income: 0, expenses: 0 });
    }

    // Aggregate transactions into bins
    for (const t of transactions) {
      const date = new Date(t.date);
      const key = getBinKey(date, scale);
      const bin = bins.get(key);
      if (bin) {
        if (t.type === 'income') bin.income += t.amount;
        else bin.expenses += t.amount;
      }
    }

    // Build output with running balance
    let runningBalance = 0;
    return binKeys.map(key => {
      const data = bins.get(key)!;
      runningBalance += data.income - data.expenses;
      return {
        label: getBinLabel(key, scale),
        income: data.income,
        expenses: data.expenses,
        balance: runningBalance,
      };
    });
  }, [transactions]);
}

/** @deprecated Alias for backwards compatibility */
export const useMonthlyData = useTimeSeriesData;


/**
 * Spending breakdown by category for pie/donut charts.
 */
export function useCategoryBreakdown(customTransactions?: Transaction[]): CategoryBreakdown[] {
  const allTransactions = useStore((s) => s.transactions);
  const transactions = customTransactions || allTransactions;

  return useMemo(() => {
    const categoryTotals = new Map<string, number>();
    let totalExpenses = 0;

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount);
        totalExpenses += t.amount;
      });

    return Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category: category as any,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 1000) / 10 : 0,
        color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6b7280',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);
}

/**
 * Filtered & sorted transactions based on current filter state.
 */
export function useFilteredTransactions(): Transaction[] {
  const transactions = useStore((s) => s.transactions);
  const searchQuery = useStore((s) => s.searchQuery);
  const filterCategory = useStore((s) => s.filterCategory);
  const filterType = useStore((s) => s.filterType);
  const sortBy = useStore((s) => s.sortBy);
  const sortDirection = useStore((s) => s.sortDirection);

  return useMemo(() => {
    let filtered = [...transactions];

    // Text search (fuzzy-ish: case-insensitive match on description, category, amount)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        cmp = a.amount - b.amount;
      }
      return sortDirection === 'desc' ? -cmp : cmp;
    });

    return filtered;
  }, [transactions, searchQuery, filterCategory, filterType, sortBy, sortDirection]);
}

/**
 * Generates smart financial alerts based on transaction patterns.
 */
export function useFinancialAlerts(customTransactions?: Transaction[]): { id: string; type: 'warning' | 'info' | 'success'; title: string; message: string }[] {
  const allTransactions = useStore((s) => s.transactions);
  const transactions = customTransactions || allTransactions;
  const metrics = useFinancialMetrics(transactions);
  const categoryData = useCategoryBreakdown(transactions);

  return useMemo(() => {
    const alerts: { id: string; type: 'warning' | 'info' | 'success'; title: string; message: string }[] = [];

    // Alert: Low savings rate
    if (metrics.savingsRate < 20 && metrics.totalIncome > 0) {
      alerts.push({
        id: 'low-savings',
        type: 'warning',
        title: 'Low Savings Rate',
        message: `Your savings rate is ${metrics.savingsRate}%. Aim for at least 20% to build a healthy emergency fund.`,
      });
    }

    // Alert: Savings rate is great
    if (metrics.savingsRate >= 50) {
      alerts.push({
        id: 'great-savings',
        type: 'success',
        title: 'Excellent Savings',
        message: `You're saving ${metrics.savingsRate}% of your income. Outstanding financial discipline.`,
      });
    }

    // Alert: Top spending category dominance
    if (categoryData.length > 0 && categoryData[0].percentage > 50) {
      alerts.push({
        id: 'category-dominance',
        type: 'warning',
        title: 'Spending Concentration',
        message: `${categoryData[0].category} accounts for ${categoryData[0].percentage}% of your expenses. Consider diversifying your budget.`,
      });
    }

    // Alert: Recent spending spike (last 7 days vs avg)
    const now = new Date('2026-04-05');
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= weekAgo)
      .reduce((s, t) => s + t.amount, 0);

    const avgWeeklyExpense = metrics.avgMonthlyExpense / 4;
    if (recentExpenses > avgWeeklyExpense * 1.5 && avgWeeklyExpense > 0) {
      alerts.push({
        id: 'spending-spike',
        type: 'warning',
        title: 'Spending Spike Detected',
        message: `You've spent ₹${recentExpenses.toLocaleString('en-IN')} this week — ${Math.round((recentExpenses / avgWeeklyExpense) * 100 - 100)}% above your weekly average.`,
      });
    }

    // Alert: Positive balance
    if (metrics.totalBalance > 100000) {
      alerts.push({
        id: 'healthy-balance',
        type: 'success',
        title: 'Healthy Balance',
        message: `Your net balance of ₹${metrics.totalBalance.toLocaleString('en-IN')} is well above the comfort zone. Consider investing the surplus.`,
      });
    }

    // Alert: Income diversity
    const incomeCategories = new Set(transactions.filter(t => t.type === 'income').map(t => t.category));
    if (incomeCategories.size >= 3) {
      alerts.push({
        id: 'income-diversity',
        type: 'info',
        title: 'Diversified Income',
        message: `You have ${incomeCategories.size} income sources. Multiple revenue streams strengthen financial resilience.`,
      });
    }

    return alerts;
  }, [transactions, metrics, categoryData]);
}

/**
 * Filtered transactions strictly for the Insights page temporal navigation.
 */
export function useInsightsTransactions(): Transaction[] {
  const transactions = useStore((s) => s.transactions);
  const dateRange = useStore((s) => s.insightsDateRange);

  return useMemo(() => {
    if (!dateRange) return transactions;
    const start = new Date(dateRange.start).getTime();
    
    // Create an end date shifted to the very end of that day (23:59:59) for inclusive filtering
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    const end = endDate.getTime();
    
    return transactions.filter(t => {
      const tDate = new Date(t.date).getTime();
      return tDate >= start && tDate <= end;
    });
  }, [transactions, dateRange]);
}