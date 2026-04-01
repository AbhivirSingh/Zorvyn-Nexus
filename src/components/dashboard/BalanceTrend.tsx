import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { format, subDays, isAfter } from 'date-fns';
import type { Transaction } from '../../types/finance';
import { formatCurrency } from '../../lib/utils';

export function BalanceTrend({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    // We want the last 30 days of data.
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    
    // Filter transactions to last 30 days and sort chronologically
    const recentTx = transactions
      .filter(tx => isAfter(new Date(tx.date), thirtyDaysAgo))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate a map of days with cumulative changes
    const dailyMap = new Map<string, number>();
    
    // Start with a base balance (mocked as 10000 for realistic visualization)
    let runningBalance = 10000;
    
    for (let i = 29; i >= 0; i--) {
        const d = subDays(today, i);
        dailyMap.set(format(d, 'MMM dd'), runningBalance);
    }
    
    // Apply transactions chronologically to the running balance
    recentTx.forEach(tx => {
      const dayKey = format(new Date(tx.date), 'MMM dd');
      if (tx.type === 'income') {
        runningBalance += tx.amount;
      } else {
        runningBalance -= tx.amount;
      }
      
      if (dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, runningBalance);
      }
    });

    // We need to apply running balance to all subsequent days if a change occurs
    let currentBal = 10000;
    const chartData = Array.from(dailyMap.entries()).map(([date, _val]) => {
      // Find transactions for this specific day to adjust currentBal
      const dayTx = recentTx.filter(t => format(new Date(t.date), 'MMM dd') === date);
      dayTx.forEach(t => {
        if (t.type === 'income') currentBal += t.amount;
        else currentBal -= t.amount;
      });
      return {
        date,
        balance: currentBal
      };
    });

    return chartData;
  }, [transactions]);

  return (
    <Card className="col-span-4 h-full">
      <CardHeader>
        <CardTitle>Balance Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
              minTickGap={20}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              width={60}
            />
            <Tooltip 
              formatter={(value: any) => [formatCurrency(value), 'Balance']}
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorBalance)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
