import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { ZorvynLogo } from './ZorvynLogo';
import { useStore } from '../../store/useStore';
import { useRole } from '../../hooks/useRole';
import { cn } from '../../lib/utils';
import { useState } from 'react';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/insights', label: 'Insights', icon: Lightbulb },
];

export function Sidebar() {
  const [location] = useLocation();
  const { role, setRole, isAdmin } = useRole();
  const resetTransactions = useStore((s) => s.resetTransactions);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 border-r border-border bg-sidebar transition-all duration-300 z-30',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border flex-shrink-0">
        <ZorvynLogo size={28} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-semibold text-sm tracking-tight overflow-hidden whitespace-nowrap"
            >
              ZORVYN
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <div
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: Role switcher + collapse */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Role Switcher */}
        <div className={cn('space-y-1.5', collapsed && 'items-center flex flex-col')}>
          {!collapsed && (
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-1">
              Role
            </span>
          )}
          <div className={cn('flex gap-1', collapsed ? 'flex-col' : '')}>
            <button
              data-testid="role-admin"
              onClick={() => setRole('admin')}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
                isAdmin
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-accent'
              )}
              aria-label="Switch to Admin role"
              aria-pressed={isAdmin}
            >
              <Shield size={14} />
              {!collapsed && 'Admin'}
            </button>
            <button
              data-testid="role-viewer"
              onClick={() => setRole('viewer')}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
                !isAdmin
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-accent'
              )}
              aria-label="Switch to Viewer role"
              aria-pressed={!isAdmin}
            >
              <Eye size={14} />
              {!collapsed && 'Viewer'}
            </button>
          </div>
        </div>

        {/* Role indicator banner */}
        <AnimatePresence>
          {!isAdmin && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-2 py-1.5 bg-warning/10 border border-warning/20 rounded-md text-[11px] text-center font-medium" style={{ color: 'hsl(var(--warning))' }}>
                Viewing as Viewer
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset data */}
        {isAdmin && !collapsed && (
          <button
            data-testid="button-reset"
            onClick={resetTransactions}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent transition-colors"
          >
            <RotateCcw size={12} />
            Reset Demo Data
          </button>
        )}

        {/* Collapse toggle */}
        <button
          data-testid="button-collapse-sidebar"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 rounded-md text-muted-foreground hover:bg-accent transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}