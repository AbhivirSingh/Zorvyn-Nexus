import { useState, useCallback, useEffect } from 'react';
import { InsightCard } from '../components/insights/InsightCard';
import { TopCategoriesChart } from '../components/insights/TopCategoriesChart';
import { BalanceTrendChart } from '../components/dashboard/BalanceTrendChart';
import { DateRangePicker } from '../components/insights/DateRangePicker';
import { useFinancialAlerts, useFinancialMetrics, useCategoryBreakdown, useMonthlyData, useInsightsTransactions } from '../hooks/useFinancialMetrics';
import { formatINR } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

export default function InsightsPage() {
  const filteredTransactions = useInsightsTransactions();

  // Artificial loading state for premium shimmer effect
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRangeChange = useCallback(() => {
    setIsRecalculating(true);
  }, []);

  useEffect(() => {
    if (!isRecalculating) return;
    const timer = setTimeout(() => setIsRecalculating(false), 600);
    return () => clearTimeout(timer);
  }, [isRecalculating]);

  // Derive all metrics from the temporally filtered transactions
  const alerts = useFinancialAlerts(filteredTransactions);
  const metrics = useFinancialMetrics(filteredTransactions);
  const categories = useCategoryBreakdown(filteredTransactions);
  const monthlyData = useMonthlyData(filteredTransactions);

  // Compute extra stats for the insights page
  const totalTransactions = filteredTransactions.length;
  const incomeTransactions = filteredTransactions.filter((t) => t.type === 'income').length;
  const expenseTransactions = filteredTransactions.filter((t) => t.type === 'expense').length;
  const avgTransactionSize = totalTransactions > 0
    ? filteredTransactions.reduce((s, t) => s + t.amount, 0) / totalTransactions
    : 0;

  return (
    <div className="space-y-6">
      {/* Temporal Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Insights</h2>
          <p className="text-xs text-muted-foreground">
            {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''} in selected period
          </p>
        </div>
        <DateRangePicker onRangeChange={handleRangeChange} />
      </div>

      {/* Quick summary stats */}
      <AnimatePresence mode="wait">
        {isRecalculating ? (
          <motion.div
            key="stats-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 text-center">
                <div className="w-20 h-2.5 bg-muted/40 rounded-full animate-pulse mx-auto mb-2" />
                <div className="w-12 h-5 bg-muted/30 rounded-full animate-pulse mx-auto" />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="stats-live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatBox label="Total Transactions" value={totalTransactions.toString()} />
            <StatBox label="Income Entries" value={incomeTransactions.toString()} color="text-emerald-500" />
            <StatBox label="Expense Entries" value={expenseTransactions.toString()} color="text-red-500" />
            <StatBox label="Avg Transaction" value={formatINR(Math.round(avgTransactionSize))} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart alerts */}
      {!isRecalculating && alerts.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
            Smart Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert, i) => (
              <InsightCard key={alert.id} type={alert.type} title={alert.title} message={alert.message} delay={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopCategoriesChart data={categories} isLoading={isRecalculating} />
        <BalanceTrendChart data={monthlyData} isLoading={isRecalculating} />
      </div>

      {/* Monthly summary */}
      <AnimatePresence mode="wait">
        {isRecalculating ? (
          <motion.div
            key="summary-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-xl p-5 space-y-3"
          >
            <div className="w-32 h-2.5 bg-muted/40 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-muted/20 rounded-full animate-pulse" />
              <div className="w-3/4 h-2.5 bg-muted/20 rounded-full animate-pulse" />
              <div className="w-5/6 h-2.5 bg-muted/20 rounded-full animate-pulse" />
            </div>
          </motion.div>
        ) : totalTransactions === 0 ? null : (
          <motion.div
            key="summary-live"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
              Financial Summary
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground text-xs leading-relaxed space-y-2">
              <p>
                Over the tracked period, your total income stands at <strong className="text-foreground">{formatINR(metrics.totalIncome)}</strong> with
                expenses at <strong className="text-foreground">{formatINR(metrics.totalExpenses)}</strong>, yielding a net
                savings of <strong className="text-emerald-500">{formatINR(metrics.totalBalance)}</strong>.
              </p>
              <p>
                Your savings rate of <strong className="text-foreground">{metrics.savingsRate}%</strong> {metrics.savingsRate >= 30 ? 'exceeds' : 'is below'} the
                recommended 30% benchmark. {categories.length > 0 && `The largest spending category is ${categories[0].category} at ${categories[0].percentage}% of total expenses.`}
              </p>
              <p>
                Your financial health score is <strong className="text-primary">{metrics.healthScore}/100</strong>, factoring in
                savings discipline, spending consistency, and income diversification.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 text-center"
    >
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{label}</p>
      <p className={`text-lg font-bold font-mono tabular-nums ${color || ''}`}>{value}</p>
    </motion.div>
  );
}