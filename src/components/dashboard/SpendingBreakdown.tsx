import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { Transaction } from '../../types/finance';
import { formatCurrency } from '../../lib/utils';

const COLORS = [
  'hsl(var(--primary))', 
  'hsl(var(--destructive))', 
  'hsl(var(--success))', 
  'hsl(var(--accent))', 
  '#f59e0b', 
  '#8b5cf6', 
  '#ec4899'
];

export function SpendingBreakdown({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const categoryMap = new Map<string, number>();
    
    expenses.forEach(tx => {
      const current = categoryMap.get(tx.category) || 0;
      categoryMap.set(tx.category, current + tx.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5 categories
  }, [transactions]);

  return (
    <Card className="col-span-3 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No expenses recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
