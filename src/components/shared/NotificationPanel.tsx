import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Info, CheckCircle, Bell } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useFinancialAlerts } from '../../hooks/useFinancialMetrics';
import { cn } from '../../lib/utils';

const alertIcons = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const alertStyles = {
  warning: 'border-amber-500/20 bg-amber-500/5',
  info: 'border-blue-500/20 bg-blue-500/5',
  success: 'border-emerald-500/20 bg-emerald-500/5',
};

const alertIconColors = {
  warning: 'text-amber-500',
  info: 'text-blue-500',
  success: 'text-emerald-500',
};

/**
 * Notification Panel — Signature Feature #3
 * Slide-in panel showing automated financial insights and alerts.
 */
export function NotificationPanel() {
  const open = useStore((s) => s.notificationPanelOpen);
  const setOpen = useStore((s) => s.setNotificationPanelOpen);
  const alerts = useFinancialAlerts();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-[340px] max-w-[90vw] bg-popover border-l border-border z-50 flex flex-col shadow-2xl"
            role="dialog"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                <h2 className="text-sm font-semibold">Smart Alerts</h2>
                {alerts.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {alerts.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                aria-label="Close notifications"
              >
                <X size={18} />
              </button>
            </div>

            {/* Alerts */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                    <CheckCircle size={24} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium">All clear</p>
                  <p className="text-xs text-muted-foreground mt-1">No new alerts or insights right now.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {alerts.map((alert, i) => {
                    const Icon = alertIcons[alert.type];
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className={cn('rounded-lg border p-3.5 flex gap-3', alertStyles[alert.type])}
                        data-testid={`notification-${alert.id}`}
                      >
                        <Icon size={16} className={cn('flex-shrink-0 mt-0.5', alertIconColors[alert.type])} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold mb-0.5">{alert.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.message}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground text-center">
                Alerts auto-generated from your transaction patterns
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}