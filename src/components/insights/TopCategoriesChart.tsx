import { motion } from 'framer-motion';
import { useCategoryBreakdown } from '../../hooks/useFinancialMetrics';
import { formatINR } from '../../data/mockData';
import { cn } from '../../lib/utils';

/** Horizontal bar chart showing top expense categories */
export function TopCategoriesChart() {
  const data = useCategoryBreakdown();
  const top = data.slice(0, 7);
  const maxAmount = top.length > 0 ? top[0].amount : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
  );
}