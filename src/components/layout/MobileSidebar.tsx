import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, Lightbulb, X, Shield, Eye } from 'lucide-react';
import { ZorvynLogo } from './ZorvynLogo';
import { useStore } from '../../store/useStore';
import { useRole } from '../../hooks/useRole';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/insights', label: 'Insights', icon: Lightbulb },
];

/** Slide-over sidebar for mobile */
export function MobileSidebar() {
  const [location] = useLocation();
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const { role, setRole, isAdmin } = useRole();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-border z-50 md:hidden flex flex-col"
            role="dialog"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
              <div className="flex items-center gap-3">
                <ZorvynLogo size={28} />
                <span className="font-semibold text-sm tracking-tight">ZORVYN</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 py-4 px-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon size={18} />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Role switcher */}
            <div className="p-4 border-t border-border space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Role</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setRole('admin')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                    isAdmin ? 'bg-primary/15 text-primary border border-primary/20' : 'text-muted-foreground bg-accent'
                  )}
                >
                  <Shield size={14} /> Admin
                </button>
                <button
                  onClick={() => setRole('viewer')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                    !isAdmin ? 'bg-primary/15 text-primary border border-primary/20' : 'text-muted-foreground bg-accent'
                  )}
                >
                  <Eye size={14} /> Viewer
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}