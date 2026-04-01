import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { Transaction } from '../../types/finance';
import { formatCurrency } from '../../lib/utils';
import { isSameMonth, subMonths } from 'date-fns';

export function Insights({ transactions }: { transactions: Transaction[] }) {
  const insights = useMemo(() => {
    const today = new Date();
    const lastMonth = subMonths(today, 1);

    // Filter to expenses only
    const expenses = transactions.filter(t => t.type === 'expense');

    // 1. Highest Spending Category
    const categoryMap = new Map<string, number>();
    let highestCategory = { name: 'None', amount: 0 };
    
    expenses.forEach(tx => {
      const current = categoryMap.get(tx.category) || 0;
      const newAmount = current + tx.amount;
      categoryMap.set(tx.category, newAmount);
      
      if (newAmount > highestCategory.amount) {
        highestCategory = { name: tx.category, amount: newAmount };
      }
    });

    // 2. This Month vs Last Month
    let thisMonthSpent = 0;
    let lastMonthSpent = 0;

    expenses.forEach(tx => {
      const txDate = new Date(tx.date);
      if (isSameMonth(txDate, today)) {
        thisMonthSpent += tx.amount;
      } else if (isSameMonth(txDate, lastMonth)) {
        lastMonthSpent += tx.amount;
      }
    });

    let spendingChange = 0;
    let spendingChangePercent = 0;

    if (lastMonthSpent > 0) {
      spendingChange = thisMonthSpent - lastMonthSpent;
      spendingChangePercent = (spendingChange / lastMonthSpent) * 100;
    }

    return {
      highestCategory,
      thisMonthSpent,
      lastMonthSpent,
      spendingChange,
      spendingChangePercent
    };
  }, [transactions]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Highest Spending Category</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insights.highestCategory.name}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(insights.highestCategory.amount)} total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Comparison</CardTitle>
          {insights.spendingChange > 0 ? (
            <TrendingUp className="h-4 w-4 text-destructive" />
          ) : (
            <TrendingDown className="h-4 w-4 text-success" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {insights.spendingChange > 0 ? '+' : ''}{formatCurrency(insights.spendingChange)}
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center">
            <span className={insights.spendingChange > 0 ? 'text-destructive font-medium' : 'text-success font-medium'}>
              {insights.spendingChange > 0 ? 'Up' : 'Down'} {Math.abs(insights.spendingChangePercent).toFixed(1)}%
            </span>
            <span className="ml-1">from last month</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
