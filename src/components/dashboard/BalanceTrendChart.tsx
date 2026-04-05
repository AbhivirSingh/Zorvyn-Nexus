import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { useMonthlyData } from '../../hooks/useFinancialMetrics';
import { formatINR } from '../../data/mockData';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { ChartSkeleton } from '../insights/ChartSkeleton';
import { TrendingUp } from 'lucide-react';
import type { TimeSeriesPoint } from '../../data/types';

type ChartView = 'balance' | 'comparison';

interface BalanceTrendChartProps {
  data?: TimeSeriesPoint[];
  isLoading?: boolean;
}

export function BalanceTrendChart({ data, isLoading }: BalanceTrendChartProps) {
  const [view, setView] = useState<ChartView>('balance');
  const hookData = useMonthlyData();
  const monthlyData = data ?? hookData;
  const isEmpty = !isLoading && monthlyData.length === 0;

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <ChartSkeleton key="skeleton-trend" />
      ) : isEmpty ? (
        <motion.div
          key="empty-trend"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card rounded-xl p-5 flex flex-col items-center justify-center h-[280px] text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center mb-3">
            <TrendingUp size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No Trend Data</p>
          <p className="text-xs text-muted-foreground max-w-[220px]">
            No transactions found for this period. Try selecting a wider date range.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="chart-trend"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
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
                    dataKey="label"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={monthlyData.length > 15 ? Math.floor(monthlyData.length / 8) : 0}
                    angle={monthlyData.length > 10 ? -30 : 0}
                    textAnchor={monthlyData.length > 10 ? 'end' : 'middle'}
                    height={monthlyData.length > 10 ? 45 : 30}
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
                    dot={monthlyData.length <= 15 ? { fill: 'hsl(var(--primary))', r: 3, strokeWidth: 0 } : false}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={monthlyData.length > 15 ? Math.floor(monthlyData.length / 8) : 0}
                    angle={monthlyData.length > 10 ? -30 : 0}
                    textAnchor={monthlyData.length > 10 ? 'end' : 'middle'}
                    height={monthlyData.length > 10 ? 45 : 30}
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
      )}
    </AnimatePresence>
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