import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpRight, ArrowDownRight, LayoutDashboard, ArrowLeftRight, Lightbulb, Sun, Moon, Download, Shield, Eye } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useLocation } from 'wouter';
import { formatINR } from '../../data/mockData';
import { cn } from '../../lib/utils';
import { exportTransactionsCSV } from '../../lib/exportCSV';

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: any;
  action: () => void;
  group: string;
}

/**
 * Command Palette (Cmd+K) — Signature Feature #1
 * Fuzzy search across transactions + quick actions + navigation.
 * Keyboard-navigable with useReducer-style focus management.
 */
export function CommandPalette() {
  const open = useStore((s) => s.commandPaletteOpen);
  const setOpen = useStore((s) => s.setCommandPaletteOpen);
  const transactions = useStore((s) => s.transactions);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const setRole = useStore((s) => s.setRole);
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build command items
  const items = useMemo<CommandItem[]>(() => {
    const commands: CommandItem[] = [
      // Navigation
      { id: 'nav-overview', label: 'Go to Overview', icon: LayoutDashboard, action: () => navigate('/'), group: 'Navigation' },
      { id: 'nav-transactions', label: 'Go to Transactions', icon: ArrowLeftRight, action: () => navigate('/transactions'), group: 'Navigation' },
      { id: 'nav-insights', label: 'Go to Insights', icon: Lightbulb, action: () => navigate('/insights'), group: 'Navigation' },
      // Actions
      { id: 'action-theme', label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: theme === 'dark' ? Sun : Moon, action: toggleTheme, group: 'Actions' },
      { id: 'action-admin', label: 'Switch to Admin', icon: Shield, action: () => setRole('admin'), group: 'Actions' },
      { id: 'action-viewer', label: 'Switch to Viewer', icon: Eye, action: () => setRole('viewer'), group: 'Actions' },
      { id: 'action-export', label: 'Export CSV', icon: Download, action: () => exportTransactionsCSV(), group: 'Actions' },
    ];

    // Add recent transactions as searchable items
    const recent = transactions.slice(0, 15);
    recent.forEach((tx) => {
      commands.push({
        id: `tx-${tx.id}`,
        label: tx.description,
        sublabel: `${formatINR(tx.amount)} · ${tx.category}`,
        icon: tx.type === 'income' ? ArrowUpRight : ArrowDownRight,
        action: () => navigate('/transactions'),
        group: 'Transactions',
      });
    });

    return commands;
  }, [transactions, theme, toggleTheme, navigate, setRole]);

  // Fuzzy filter
  const filtered = useMemo(() => {
    if (!query.trim()) return items.filter(i => i.group !== 'Transactions').concat(items.filter(i => i.group === 'Transactions').slice(0, 5));
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.sublabel?.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Keyboard navigation in list
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
        setOpen(false);
      }
    },
    [filtered, selectedIndex, setOpen]
  );

  // Reset selection when results change
  useEffect(() => setSelectedIndex(0), [filtered]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Group items for display
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    filtered.forEach((item) => {
      if (!groups.has(item.group)) groups.set(item.group, []);
      groups.get(item.group)!.push(item);
    });
    return groups;
  }, [filtered]);

  let globalIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.96, x: "-50%", y: "-50%" }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed left-1/2 top-1/2 w-[90%] max-w-md bg-popover border border-popover-border rounded-xl shadow-2xl z-50 overflow-hidden"
            role="dialog"
            aria-label="Command palette"
            aria-modal="true"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search size={16} className="text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                data-testid="input-command-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search transactions, navigate, or run actions..."
                className="flex-1 py-3 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                aria-label="Command palette search"
              />
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2" role="listbox">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No results found</p>
              ) : (
                Array.from(grouped.entries()).map(([group, groupItems]) => (
                  <div key={group}>
                    <p className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{group}</p>
                    {groupItems.map((item) => {
                      const idx = globalIndex++;
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          data-index={idx}
                          onClick={() => { item.action(); setOpen(false); }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors',
                            idx === selectedIndex ? 'bg-accent' : ''
                          )}
                          role="option"
                          aria-selected={idx === selectedIndex}
                        >
                          <Icon size={16} className="text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.label}</p>
                            {item.sublabel && (
                              <p className="text-[11px] text-muted-foreground truncate">{item.sublabel}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-muted font-mono">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-muted font-mono">↵</kbd> Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-muted font-mono">esc</kbd> Close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}