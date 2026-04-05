import { InsightCard } from '../components/insights/InsightCard';
import { TopCategoriesChart } from '../components/insights/TopCategoriesChart';
import { BalanceTrendChart } from '../components/dashboard/BalanceTrendChart';
import { useFinancialAlerts, useFinancialMetrics, useCategoryBreakdown } from '../hooks/useFinancialMetrics';
import { formatINR } from '../data/mockData';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function InsightsPage() {
  const alerts = useFinancialAlerts();
  const metrics = useFinancialMetrics();
  const categories = useCategoryBreakdown();
  const transactions = useStore((s) => s.transactions);

  // Compute extra stats for the insights page
  const totalTransactions = transactions.length;
  const incomeTransactions = transactions.filter((t) => t.type === 'income').length;
  const expenseTransactions = transactions.filter((t) => t.type === 'expense').length;
  const avgTransactionSize = totalTransactions > 0
    ? transactions.reduce((s, t) => s + t.amount, 0) / totalTransactions
    : 0;

  return (
    <div className="space-y-6">
      {/* Quick summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Total Transactions" value={totalTransactions.toString()} />
        <StatBox label="Income Entries" value={incomeTransactions.toString()} color="text-emerald-500" />
        <StatBox label="Expense Entries" value={expenseTransactions.toString()} color="text-red-500" />
        <StatBox label="Avg Transaction" value={formatINR(Math.round(avgTransactionSize))} />
      </div>

      {/* Smart alerts */}
      {alerts.length > 0 && (
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
            Smart Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert, i) => (
              <InsightCard key={alert.id} type={alert.type} title={alert.title} message={alert.message} delay={i} />
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopCategoriesChart />
        <BalanceTrendChart />
      </div>

      {/* Monthly summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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