import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { FinancialMetrics, MonthlyData, CategoryBreakdown, Transaction } from '../data/types';
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

    // Health score: weighted formula (0-100)
    // 40% savings rate, 30% spending consistency, 20% category diversity, 10% balance trend
    const savingsScore = Math.min(savingsRate / 50 * 40, 40); // Max 40 pts at 50%+ savings
    const consistencyScore = monthsWithExpenses >= 3 ? 25 : monthsWithExpenses * 8; // Regular tracking
    const categories = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));
    const diversityScore = Math.min(categories.size * 3, 20); // Diversified spending
    const balanceScore = totalBalance > 0 ? 15 : totalBalance > -10000 ? 8 : 0;
    const healthScore = Math.round(Math.min(savingsScore + consistencyScore + diversityScore + balanceScore, 100));

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
 * Monthly income/expense/balance data for trend charts.
 * Returns last 6 months of aggregated data.
 */
export function useMonthlyData(customTransactions?: Transaction[]): MonthlyData[] {
  const allTransactions = useStore((s) => s.transactions);
  const transactions = customTransactions || allTransactions;

  return useMemo(() => {
    const monthMap = new Map<string, { income: number; expenses: number }>();

    // Generate last 6 months
    const now = new Date(2026, 3, 5); // April 2026 context
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, { income: 0, expenses: 0 });
    }

    transactions.forEach((t) => {
      const key = t.date.substring(0, 7);
      const entry = monthMap.get(key);
      if (entry) {
        if (t.type === 'income') entry.income += t.amount;
        else entry.expenses += t.amount;
      }
    });

    let runningBalance = 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return Array.from(monthMap.entries()).map(([key, data]) => {
      const monthIdx = parseInt(key.split('-')[1]) - 1;
      runningBalance += data.income - data.expenses;
      return {
        month: months[monthIdx],
        income: data.income,
        expenses: data.expenses,
        balance: runningBalance,
      };
    });
  }, [transactions]);
}

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