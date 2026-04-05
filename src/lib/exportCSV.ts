import { useStore } from '../store/useStore';
import { formatINR } from '../data/mockData';
import { toast } from '../components/ui/toaster';
import type { Transaction } from '../data/types';

/**
 * Properly escape a CSV field:
 * - Wrap in quotes if it contains commas, quotes, or newlines
 * - Double any internal quotes
 */
function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export transactions as a high-fidelity CSV file.
 * - UTF-8 BOM for proper encoding of ₹ and special characters
 * - Proper CSV escaping for descriptions with commas
 * - Formatted amount column alongside raw amount
 * - Toast notification on success
 */
export function exportTransactionsCSV(transactions?: Transaction[]) {
  const txs = transactions || useStore.getState().transactions;

  if (txs.length === 0) {
    toast('No transactions to export.', 'warning');
    return;
  }

  const headers = ['Date', 'Description', 'Amount (₹)', 'Amount (Raw)', 'Category', 'Type'];

  const rows = txs.map(t => [
    escapeCSV(t.date),
    escapeCSV(t.description),
    escapeCSV(formatINR(t.amount)),
    escapeCSV(t.amount),
    escapeCSV(t.category),
    escapeCSV(t.type),
  ].join(','));

  const csvContent = [headers.map(escapeCSV).join(','), ...rows].join('\r\n');

  // UTF-8 BOM ensures Excel and other tools correctly read ₹ symbols
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `zorvyn-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  toast(`Exported ${txs.length} transactions successfully.`, 'success');
}
