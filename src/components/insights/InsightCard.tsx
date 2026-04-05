import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InsightCardProps {
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  delay?: number;
}

const icons = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const styles = {
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: 'text-amber-500',
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/20',
    icon: 'text-blue-500',
  },
  success: {
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: 'text-emerald-500',
  },
};

export function InsightCard({ type, title, message, delay = 0 }: InsightCardProps) {
  const Icon = icons[type];
  const style = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.1 }}
      className={cn('rounded-xl border p-4 flex gap-3', style.bg)}
      data-testid={`insight-${type}-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className={cn('flex-shrink-0 mt-0.5', style.icon)}>
        <Icon size={18} />
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-0.5">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
}