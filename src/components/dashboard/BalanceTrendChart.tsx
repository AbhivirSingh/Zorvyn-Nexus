import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { useMonthlyData } from '../../hooks/useFinancialMetrics';
import { formatINR } from '../../data/mockData';
import { useState } from 'react';
import { cn } from '../../lib/utils';

type ChartView = 'balance' | 'comparison';

export function BalanceTrendChart() {
  const monthlyData = useMonthlyData();
  const [view, setView] = useState<ChartView>('balance');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card rounded-xl p-5"
      data-testid="chart-balance-trend"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {view === 'balance' ? 'Balance Trend' : 'Income vs Expenses'}
        </h3>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
          <button
            onClick={() => setView('balance')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors',
              view === 'balance' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            Trend
          </button>
          <button
            onClick={() => setView('comparison')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors',
              view === 'comparison' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            Compare
          </button>
        </div>
      </div>

      <div className="h-[220px] md:h-[260px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'balance' ? (
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatINR(v, true)}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#balanceGradient)"
                dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              />
            </AreaChart>
          ) : (
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatINR(v, true)}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}
              />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-popover-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.name || entry.dataKey}:</span>
          <span className="font-mono font-medium">{formatINR(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}