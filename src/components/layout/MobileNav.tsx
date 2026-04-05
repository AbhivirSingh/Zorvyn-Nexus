import { Link, useLocation } from 'wouter';
import { LayoutDashboard, ArrowLeftRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/transactions', label: 'Txns', icon: ArrowLeftRight },
  { path: '/insights', label: 'Insights', icon: Lightbulb },
];

/** Bottom tab navigation for mobile viewports */
export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex justify-around items-center h-14 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors relative cursor-pointer',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} className="relative z-10" />
                <span className="text-[10px] font-medium relative z-10">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}