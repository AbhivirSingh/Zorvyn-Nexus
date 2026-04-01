import type { Transaction } from '../../types/finance';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionList({ transactions, limit }: TransactionListProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <Card className="col-span-1 border shadow-sm">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayTransactions.map((transaction) => {
            const isIncome = transaction.type === 'income';
            return (
              <div key={transaction.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    isIncome ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                  )}>
                    {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                    <div className="flex items-center mt-1.5 space-x-2 text-xs text-muted-foreground">
                      <span className="font-medium bg-secondary px-2 py-0.5 rounded-full">{transaction.category}</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
                <div className={cn("text-sm font-medium", isIncome ? "text-success" : "text-destructive")}>
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            );
          })}
          
          {displayTransactions.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No transactions found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
