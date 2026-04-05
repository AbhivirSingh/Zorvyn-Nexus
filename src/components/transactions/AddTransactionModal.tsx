import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ALL_CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../data/types';
import type { TransactionType, Category } from '../../data/types';
import { cn } from '../../lib/utils';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
  const addTransaction = useStore((s) => s.addTransaction);
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = 'Required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Must be positive';
    if (!date) newErrors.date = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addTransaction({
      date,
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      type,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setCategory(type === 'income' ? 'Salary' : 'Food & Dining');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 w-[90%] max-w-md bg-popover border border-popover-border rounded-xl shadow-2xl z-50 p-6"
            role="dialog"
            aria-label="Add transaction"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Add Transaction</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="flex gap-2 bg-muted/50 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => { setType('expense'); setCategory('Food & Dining'); }}
                  className={cn(
                    'flex-1 py-2 rounded-md text-sm font-medium transition-colors',
                    type === 'expense' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  )}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => { setType('income'); setCategory('Salary'); }}
                  className={cn(
                    'flex-1 py-2 rounded-md text-sm font-medium transition-colors',
                    type === 'income' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  )}
                >
                  Income
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <input
                  data-testid="input-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Monthly salary"
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50',
                    errors.description ? 'border-destructive' : 'border-border'
                  )}
                />
                {errors.description && <p className="text-[11px] text-destructive mt-1">{errors.description}</p>}
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount (₹)</label>
                <input
                  data-testid="input-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  step="1"
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/50',
                    errors.amount ? 'border-destructive' : 'border-border'
                  )}
                />
                {errors.amount && <p className="text-[11px] text-destructive mt-1">{errors.amount}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <select
                  data-testid="select-add-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                <input
                  data-testid="input-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>

              {/* Submit */}
              <motion.button
                data-testid="button-submit-transaction"
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Add {type === 'income' ? 'Income' : 'Expense'}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}