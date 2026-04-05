import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown, Trash2, Search, Filter, ArrowUpRight, ArrowDownRight, ChevronDown,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useFilteredTransactions } from '../../hooks/useFinancialMetrics';
import { useRole } from '../../hooks/useRole';
import { formatINR, formatDate } from '../../data/mockData';
import { ALL_CATEGORIES, CATEGORY_COLORS } from '../../data/types';
import { EmptyState } from '../shared/EmptyState';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { AddTransactionModal } from './AddTransactionModal';

export function TransactionTable() {
  const filtered = useFilteredTransactions();
  const { canDelete, canAdd } = useRole();
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const filterCategory = useStore((s) => s.filterCategory);
  const setFilterCategory = useStore((s) => s.setFilterCategory);
  const filterType = useStore((s) => s.filterType);
  const setFilterType = useStore((s) => s.setFilterType);
  const sortBy = useStore((s) => s.sortBy);
  const setSortBy = useStore((s) => s.setSortBy);
  const sortDirection = useStore((s) => s.sortDirection);
  const setSortDirection = useStore((s) => s.setSortDirection);
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            data-testid="input-search"
            type="search"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            aria-label="Search transactions"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            data-testid="select-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="appearance-none pl-9 pr-8 py-2 rounded-lg border border-border bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Type filter */}
        <div className="relative">
          <select
            data-testid="select-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Add button (admin only) */}
        {canAdd && (
          <motion.button
            data-testid="button-add-transaction"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            + Add Transaction
          </motion.button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description={searchQuery ? 'Try adjusting your search or filters.' : 'Add your first transaction to get started.'}
          actionLabel="Add Transaction"
          onAction={() => setShowAddModal(true)}
          showAction={canAdd}
        />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_100px_100px_40px] gap-4 px-5 py-3 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            <span>Description</span>
            <button
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              onClick={() => toggleSort('date')}
              aria-label="Sort by date"
            >
              Date <ArrowUpDown size={12} className={sortBy === 'date' ? 'text-primary' : ''} />
            </button>
            <span>Category</span>
            <button
              className="flex items-center gap-1 hover:text-foreground transition-colors text-right justify-end"
              onClick={() => toggleSort('amount')}
              aria-label="Sort by amount"
            >
              Amount <ArrowUpDown size={12} className={sortBy === 'amount' ? 'text-primary' : ''} />
            </button>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y divide-border" role="list" aria-label="Transaction list">
            <AnimatePresence mode="popLayout">
              {filtered.map((tx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_120px_100px_100px_40px] gap-2 sm:gap-4 px-5 py-3.5 hover:bg-accent/50 transition-colors items-center"
                  role="listitem"
                  data-testid={`row-transaction-${tx.id}`}
                >
                  {/* Description + type indicator */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                    )}>
                      {tx.type === 'income' ? (
                        <ArrowUpRight size={16} className="text-emerald-500" />
                      ) : (
                        <ArrowDownRight size={16} className="text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-[11px] text-muted-foreground sm:hidden">{formatDate(tx.date)} · {tx.category}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <span className="hidden sm:block text-xs text-muted-foreground font-mono">{formatDate(tx.date)}</span>

                  {/* Category badge */}
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[tx.category] }} />
                    <span className="truncate text-muted-foreground">{tx.category}</span>
                  </span>

                  {/* Amount */}
                  <span className={cn(
                    'text-sm font-mono font-semibold tabular-nums sm:text-right',
                    tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                  </span>

                  {/* Actions */}
                  {canDelete ? (
                    <button
                      data-testid={`button-delete-${tx.id}`}
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Delete transaction: ${tx.description}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <span />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer: count */}
          <div className="px-5 py-2.5 border-t border-border text-[11px] text-muted-foreground">
            Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Add modal */}
      <AddTransactionModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}