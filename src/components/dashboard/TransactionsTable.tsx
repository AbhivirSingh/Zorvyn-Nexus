import { useFinanceStore } from '../../store/useFinanceStore';
import { useFilteredTransactions } from '../../hooks/useFilteredTransactions';
import { 
  Pencil, Trash2, Search, Filter, 
  Home, Utensils, Zap, Tv, Laptop, 
  Car, ShoppingCart, Heart, TrendingUp, CreditCard,
  ArrowUpRight, ArrowDownRight, FolderOpen
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/Card';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Salary': <CreditCard className="w-4 h-4" />,
  'Rent': <Home className="w-4 h-4" />,
  'Food': <Utensils className="w-4 h-4" />,
  'Utilities': <Zap className="w-4 h-4" />,
  'Entertainment': <Tv className="w-4 h-4" />,
  'Freelance': <Laptop className="w-4 h-4" />,
  'Transport': <Car className="w-4 h-4" />,
  'Shopping': <ShoppingCart className="w-4 h-4" />,
  'Health': <Heart className="w-4 h-4" />,
  'Investment': <TrendingUp className="w-4 h-4" />
};

export function TransactionsTable() {
  const transactions = useFilteredTransactions();
  const { role, filters, setFilters } = useFinanceStore();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ category: e.target.value });
  };

  const allCategories = ['Salary', 'Rent', 'Food', 'Utilities', 'Entertainment', 'Freelance', 'Transport', 'Shopping', 'Health', 'Investment'];

  return (
    <div className="space-y-4 w-full">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card text-card-foreground p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by description or category..."
            value={filters.search}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 border rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="w-full pl-9 pr-4 py-2 border rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
          >
            <option value="">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card border-dashed min-h-[400px]">
          <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No transactions found</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            We couldn't find any data matching your current filters. Try adjusting your search query or category selection.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    {role === 'Admin' && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const icon = CATEGORY_ICONS[tx.category] || <CreditCard className="w-4 h-4" />;
                    return (
                      <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{tx.description}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="p-1.5 bg-secondary rounded-md text-secondary-foreground">{icon}</span>
                            <span>{tx.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatDate(tx.date)}</td>
                        <td className="px-6 py-4">
                          <div className={cn(
                            "inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold",
                            isIncome ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          )}>
                            {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            <span className="capitalize">{tx.type}</span>
                          </div>
                        </td>
                        <td className={cn(
                          "px-6 py-4 text-right font-bold whitespace-nowrap",
                          isIncome ? "text-success" : "text-foreground"
                        )}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        {role === 'Admin' && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors rounded-md" aria-label="Edit transaction">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-md" aria-label="Delete transaction">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const icon = CATEGORY_ICONS[tx.category] || <CreditCard className="w-4 h-4" />;
              
              return (
                <Card key={tx.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 flex items-center justify-between border-b">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-secondary rounded-lg text-secondary-foreground">
                          {icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-bold text-sm",
                          isIncome ? "text-success" : "text-foreground"
                        )}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    {role === 'Admin' && (
                      <div className="bg-muted/30 px-4 py-2 flex justify-end space-x-4">
                        <button className="text-xs flex items-center text-muted-foreground hover:text-foreground font-medium">
                          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                        </button>
                        <button className="text-xs flex items-center text-destructive hover:text-destructive/80 font-medium">
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
