import { useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { isWithinInterval, parseISO } from 'date-fns';

export function useFilteredTransactions() {
  const { transactions, filters } = useFinanceStore();

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      const matchesSearch = tx.description.toLowerCase().includes(filters.search.toLowerCase()) || 
                            tx.category.toLowerCase().includes(filters.search.toLowerCase());
      
      // Category filter
      const matchesCategory = filters.category ? tx.category === filters.category : true;
      
      // Date range filter
      let matchesDateRange = true;
      if (filters.dateRange.start && filters.dateRange.end) {
        try {
          const txDate = parseISO(tx.date);
          const start = parseISO(filters.dateRange.start);
          const end = parseISO(filters.dateRange.end);
          // Set end time to max to include the whole day
          end.setHours(23, 59, 59, 999);
          matchesDateRange = isWithinInterval(txDate, { start, end });
        } catch (e) {
          // If date parsing fails, ignore date filter
          console.error("Invalid date format", e);
        }
      } else if (filters.dateRange.start) {
        try {
          const txDate = parseISO(tx.date);
          const start = parseISO(filters.dateRange.start);
          matchesDateRange = txDate >= start;
        } catch (e) {}
      } else if (filters.dateRange.end) {
        try {
          const txDate = parseISO(tx.date);
          const end = parseISO(filters.dateRange.end);
          end.setHours(23, 59, 59, 999);
          matchesDateRange = txDate <= end;
        } catch (e) {}
      }

      return matchesSearch && matchesCategory && matchesDateRange;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters]);

  return filteredTransactions;
}
