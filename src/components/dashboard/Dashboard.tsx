import { useMemo } from 'react';
import { SummaryCards } from './SummaryCards';
import { TransactionList } from './TransactionList';
import type { DashboardStats } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useFilteredTransactions } from '../../hooks/useFilteredTransactions';
import { Plus } from 'lucide-react';
import { BalanceTrend } from './BalanceTrend';
import { SpendingBreakdown } from './SpendingBreakdown';
import { Insights } from './Insights';

export default function Dashboard() {
  const { transactions, role } = useFinanceStore();
  const filteredTransactions = useFilteredTransactions();

  const stats = useMemo<DashboardStats>(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    const recentTransactions = transactions.slice(0, 10);

    transactions.forEach((tx) => {
      if (tx.type === 'income') totalIncome += tx.amount;
      if (tx.type === 'expense') totalExpense += tx.amount;
    });

    return {
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense,
      recentTransactionsCount: recentTransactions.length,
    };
  }, [transactions]);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <div className="flex items-center space-x-2">
          {role === 'Admin' && (
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              <Plus className="mr-2 h-4 w-4" /> Add Transaction
            </button>
          )}
        </div>
      </div>
      
      <SummaryCards stats={stats} />
      
      <Insights transactions={transactions} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <BalanceTrend transactions={filteredTransactions} />
        <SpendingBreakdown transactions={filteredTransactions} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-7">
          <TransactionList transactions={filteredTransactions} limit={5} />
        </div>
      </div>
    </div>
  );
}
