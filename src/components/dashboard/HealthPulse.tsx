import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useFinancialMetrics } from '../../hooks/useFinancialMetrics';
import { cn } from '../../lib/utils';

/**
 * Financial Health Pulse — Signature Feature #2
 * Animated radial gauge (0-100) synthesizing savings rate, spending consistency,
 * category diversity, and balance health into one glanceable metric.
 */
export function HealthPulse() {
  const metrics = useFinancialMetrics();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  const { score, label, color, gradient } = useMemo(() => {
    const s = metrics.healthScore;
    if (s >= 80) return { score: s, label: 'Excellent', color: '#10b981', gradient: ['#06b6d4', '#10b981'] };
    if (s >= 60) return { score: s, label: 'Good', color: '#3b82f6', gradient: ['#06b6d4', '#3b82f6'] };
    if (s >= 40) return { score: s, label: 'Fair', color: '#f59e0b', gradient: ['#f59e0b', '#ef4444'] };
    return { score: s, label: 'Needs Attention', color: '#ef4444', gradient: ['#ef4444', '#dc2626'] };
  }, [metrics.healthScore]);

  // SVG arc calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = isInView ? (score / 100) * circumference : 0;
  const dashOffset = circumference - progress;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-5 flex flex-col items-center"
      data-testid="widget-health-pulse"
    >
      <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-4 self-start">
        Financial Health
      </h3>

      {/* Radial gauge */}
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144" className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx="72" cy="72" r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            opacity="0.3"
          />
          {/* Progress arc */}
          <circle
            cx="72" cy="72" r={radius}
            fill="none"
            stroke={`url(#health-gradient)`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          <defs>
            <linearGradient id="health-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold font-mono tabular-nums"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            style={{ color }}
          >
            {isInView ? score : 0}
          </motion.span>
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">/100</span>
        </div>
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <span className="text-sm font-semibold" style={{ color }}>{label}</span>
      </div>

      {/* Breakdown mini-stats */}
      <div className="mt-4 w-full space-y-2">
        <MiniStat label="Savings Rate" value={`${metrics.savingsRate}%`} good={metrics.savingsRate >= 30} />
        <MiniStat label="Monthly Avg Expense" value={`₹${metrics.avgMonthlyExpense.toLocaleString('en-IN')}`} good={true} />
        <MiniStat label="Net Balance" value={`₹${metrics.totalBalance.toLocaleString('en-IN')}`} good={metrics.totalBalance > 0} />
      </div>
    </motion.div>
  );
}

function MiniStat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-mono font-medium', good ? 'text-emerald-500' : 'text-red-400')}>
        {value}
      </span>
    </div>
  );
}