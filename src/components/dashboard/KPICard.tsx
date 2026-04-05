import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { cn } from '../../lib/utils';

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'default' | 'income' | 'expense' | 'warning';
  formatter?: (n: number) => string;
  delay?: number;
}

const colorMap = {
  default: 'text-primary',
  income: 'text-emerald-500',
  expense: 'text-red-500',
  warning: 'text-amber-500',
};

const bgMap = {
  default: 'bg-primary/10',
  income: 'bg-emerald-500/10',
  expense: 'bg-red-500/10',
  warning: 'bg-amber-500/10',
};

export function KPICard({
  label,
  value,
  prefix = '₹',
  suffix,
  icon: Icon,
  trend,
  color = 'default',
  formatter,
  delay = 0,
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08 }}
      className="glass-card rounded-xl p-4 md:p-5 flex flex-col gap-3"
      data-testid={`kpi-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
        <div className={cn('p-2 rounded-lg', bgMap[color])}>
          <Icon size={16} className={colorMap[color]} />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <AnimatedNumber
          value={value}
          prefix={prefix}
          suffix={suffix}
          className="text-xl font-bold font-mono tracking-tight"
          formatter={formatter}
        />
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-medium',
              trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}