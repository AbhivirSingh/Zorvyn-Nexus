import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Toast Types ───────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ─── Global imperative API ─────────────────────────────────────────
let globalShowToast: (message: string, type?: ToastType) => void = () => {};

export function toast(message: string, type: ToastType = 'success') {
  globalShowToast(message, type);
}

// ─── Provider + Renderer ──────────────────────────────────────────
const TOAST_DURATION = 3500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Register global API
  useEffect(() => {
    globalShowToast = showToast;
    return () => { globalShowToast = () => {}; };
  }, [showToast]);

  // Auto-dismiss
  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    const timer = setTimeout(() => dismiss(latest.id), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toasts, dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container (bottom-right) */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ─── Toast Item ───────────────────────────────────────────────────
const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/40 bg-red-500/10 text-red-400',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  info: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
};

const ICON_COLORS = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const IconComponent = ICONS[t.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95, x: 40 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md min-w-[280px] max-w-[380px]',
        COLORS[t.type]
      )}
    >
      <IconComponent size={18} className={cn('shrink-0', ICON_COLORS[t.type])} />
      <p className="text-sm font-medium flex-1">{t.message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─── Legacy Toaster stub (backwards compat) ───────────────────────
export function Toaster() {
  return null;
}
