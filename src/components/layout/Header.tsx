import { Sun, Moon, Bell, Search, Menu, Download } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useStore } from '../../store/useStore';
import { useRole } from '../../hooks/useRole';
import { useFinancialAlerts } from '../../hooks/useFinancialMetrics';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { toggleTheme, isDark } = useTheme();
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen);
  const notificationPanelOpen = useStore((s) => s.notificationPanelOpen);
  const setNotificationPanelOpen = useStore((s) => s.setNotificationPanelOpen);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const { role } = useRole();
  const alerts = useFinancialAlerts();
  const undismissedCount = alerts.length;

  const handleExportCSV = () => {
    const transactions = useStore.getState().transactions;
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Type'];
    const rows = transactions.map((t) => [t.date, t.description, t.amount, t.category, t.type]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zorvyn-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      {/* Left: Mobile menu + Title */}
      <div className="flex items-center gap-3">
        <button
          data-testid="button-mobile-menu"
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold tracking-tight" data-testid="text-page-title">{title}</h1>

        {/* Role badge */}
        <AnimatePresence mode="wait">
          <motion.span
            key={role}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={cn(
              'hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
              role === 'admin'
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-warning/10 border-warning/20'
            )}
            style={role === 'viewer' ? { color: 'hsl(var(--warning))' } : undefined}
            data-testid="text-role-badge"
          >
            {role === 'admin' ? 'Admin' : 'Viewer'}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Search trigger */}
        <button
          data-testid="button-search"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-accent transition-colors"
          aria-label="Open command palette"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono font-medium">
            ⌘K
          </kbd>
        </button>

        {/* Export */}
        <button
          data-testid="button-export"
          onClick={handleExportCSV}
          className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          aria-label="Export transactions as CSV"
          title="Export CSV"
        >
          <Download size={18} />
        </button>

        {/* Notifications */}
        <button
          data-testid="button-notifications"
          onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
          className="relative p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          aria-label={`Notifications ${undismissedCount > 0 ? `(${undismissedCount} new)` : ''}`}
        >
          <Bell size={18} />
          {undismissedCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
            >
              {undismissedCount}
            </motion.span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          data-testid="button-theme"
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDark ? 'dark' : 'light'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
}