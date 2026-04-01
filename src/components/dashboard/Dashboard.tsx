import { useMemo } from 'react';
import { SummaryCards } from './SummaryCards';
import { TransactionList } from './TransactionList';
import { mockTransactions } from '../../lib/mock-data';
import type { DashboardStats } from '../../types/finance';

export default function Dashboard() {
  const stats = useMemo<DashboardStats>(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    const recentTransactions = mockTransactions.slice(0, 10);

    mockTransactions.forEach((tx) => {
      if (tx.type === 'income') totalIncome += tx.amount;
      if (tx.type === 'expense') totalExpense += tx.amount;
    });

    return {
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense,
      recentTransactionsCount: recentTransactions.length,
    };
  }, []);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <div className="flex items-center space-x-2">
          {/* Action buttons like 'Download Report' could go here */}
        </div>
      </div>
      
      <SummaryCards stats={stats} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 border rounded-xl bg-card text-card-foreground shadow p-6 flex items-center justify-center min-h-[400px]">
          {/* Placeholder for future charting component (e.g., Recharts) */}
          <div className="text-muted-foreground flex flex-col items-center placeholder-animation">
            <span className="mb-2">Monthly Revenue Chart</span>
            <span className="text-xs">Coming soon</span>
          </div>
        </div>
        
        <div className="col-span-3">
          <TransactionList transactions={mockTransactions} limit={5} />
        </div>
      </div>
    </div>
  );
}
