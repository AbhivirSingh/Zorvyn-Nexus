import { motion, AnimatePresence } from 'framer-motion';
import { useCategoryBreakdown } from '../../hooks/useFinancialMetrics';
import { formatINR } from '../../data/mockData';
import { ChartSkeleton } from './ChartSkeleton';
import { BarChart3 } from 'lucide-react';
import type { CategoryBreakdown } from '../../data/types';

interface TopCategoriesChartProps {
  data?: CategoryBreakdown[];
  isLoading?: boolean;
}

/** Horizontal bar chart showing top expense categories */
export function TopCategoriesChart({ data, isLoading }: TopCategoriesChartProps) {
  const hookData = useCategoryBreakdown();
  const top = (data ?? hookData).slice(0, 7);
  const maxAmount = top.length > 0 ? top[0].amount : 1;
  const isEmpty = !isLoading && top.length === 0;

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <ChartSkeleton key="skeleton-top" />
      ) : isEmpty ? (
        <motion.div
          key="empty-top"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card rounded-xl p-5 flex flex-col items-center justify-center h-[280px] text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center mb-3">
            <BarChart3 size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No Spending Data</p>
          <p className="text-xs text-muted-foreground max-w-[220px]">
            No expense transactions found for this period. Try expanding the date range.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="chart-top"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-5"
          data-testid="chart-top-categories"
        >
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-4">
            Top Spending Categories
          </h3>

          <div className="space-y-3">
            {top.map((item, i) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.category}</span>
                  </div>
                  <span className="font-mono font-medium">{formatINR(item.amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.amount / maxAmount) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}