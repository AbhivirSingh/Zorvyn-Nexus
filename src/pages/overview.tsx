import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { BalanceTrendChart } from '../components/dashboard/BalanceTrendChart';
import { SpendingBreakdown } from '../components/dashboard/SpendingBreakdown';
import { HealthPulse } from '../components/dashboard/HealthPulse';
import { useFinancialMetrics } from '../hooks/useFinancialMetrics';
import { formatINR } from '../data/mockData';

export default function OverviewPage() {
  const metrics = useFinancialMetrics();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Balance"
          value={metrics.totalBalance}
          icon={Wallet}
          color="default"
          trend={{ value: 12.4, label: 'vs last month' }}
          formatter={(n) => formatINR(n).replace('₹', '')}
          delay={0}
        />
        <KPICard
          label="Total Income"
          value={metrics.totalIncome}
          icon={TrendingUp}
          color="income"
          trend={{ value: 8.2, label: 'vs last month' }}
          formatter={(n) => formatINR(n).replace('₹', '')}
          delay={1}
        />
        <KPICard
          label="Total Expenses"
          value={metrics.totalExpenses}
          icon={TrendingDown}
          color="expense"
          trend={{ value: -3.1, label: 'vs last month' }}
          formatter={(n) => formatINR(n).replace('₹', '')}
          delay={2}
        />
        <KPICard
          label="Savings Rate"
          value={metrics.savingsRate}
          prefix=""
          suffix="%"
          icon={PiggyBank}
          color={metrics.savingsRate >= 30 ? 'income' : 'warning'}
          delay={3}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BalanceTrendChart />
        </div>
        <div>
          <HealthPulse />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        <SpendingBreakdown />
      </div>
    </div>
  );
}