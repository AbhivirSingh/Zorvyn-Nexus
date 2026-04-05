import { motion } from 'framer-motion';
import { Inbox, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

/** Graceful empty state with illustration and optional CTA */
export function EmptyState({ title, description, actionLabel, onAction, showAction = true }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Inbox size={28} className="text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-[280px] mb-4">{description}</p>
      {showAction && actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="gap-1.5">
          <Plus size={14} />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}