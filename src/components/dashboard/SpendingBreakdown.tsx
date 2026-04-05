import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useCategoryBreakdown } from '../../hooks/useFinancialMetrics';
import { formatINR } from '../../data/mockData';
import { cn } from '../../lib/utils';

function ChartTooltip({ item }: { item: any }) {
  const xOffset = useMotionValue("-50%");
  const pointerX = useMotionValue("-50%");

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // Synchronous DOM measurement before browser paints the first visible frame
      const rect = node.getBoundingClientRect();
      const padding = 12;
      
      let shift = 0;
      if (rect.right > window.innerWidth - padding) {
        shift = (window.innerWidth - padding) - rect.right;
      } else if (rect.left < padding) {
        shift = padding - rect.left;
      }

      if (shift !== 0) {
        // Adjust the tooltip wrapper position instantly
        xOffset.set(`calc(-50% + ${shift}px)`);
        
        // Counter-adjust the pointer arrow so it stays anchored to the hovered segment
        const maxShift = (rect.width / 2) - 12; 
        const boundedPointerShift = Math.max(Math.min(-shift, maxShift), -maxShift);
        pointerX.set(`calc(-50% + ${boundedPointerShift}px)`);
      }
    }
  }, [xOffset, pointerX]);

  return (
    <motion.div
      ref={ref}
      style={{ x: xOffset }}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute bottom-full top-auto mb-3 px-3 py-1.5 bg-[#18181b] dark:bg-[#27272a] text-white text-[11px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap z-50 pointer-events-none"
    >
      <div className="flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}80` }} 
        />
        <span>{item.category}</span>
        <span className="opacity-60 ml-0.5 tabular-nums">{item.percentage.toFixed(1)}%</span>
      </div>
      
      {/* Tooltip subtle pointer logic */}
      <motion.div 
        style={{ x: pointerX }}
        className="absolute top-full left-1/2 border-4 border-transparent border-t-[#18181b] dark:border-t-[#27272a]" 
      />
    </motion.div>
  );
}

export function SpendingBreakdown() {
  const data = useCategoryBreakdown();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5 flex items-center justify-center h-[400px] text-sm text-muted-foreground">
        No expense data to display
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card rounded-xl p-5 flex flex-col h-[400px] md:h-full relative overflow-visible"
      data-testid="chart-spending-breakdown"
    >
      <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-6 flex-shrink-0">
        Spending Breakdown
      </h3>

      {/* Main Segmented Tracker - Hidden on mobile, shown sm+ */}
      <div className="hidden sm:flex w-full h-8 rounded-full mb-6 bg-muted/20 flex-shrink-0 flex-nowrap p-1 gap-1 items-stretch shadow-inner">
        {data.map((item) => (
          <div
            key={`segment-${item.category}`}
            className="h-full relative group"
            style={{ width: `${Math.max(item.percentage, 1)}%` }}
            onMouseEnter={() => setHoveredCategory(item.category)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {/* The actual colored bar segment */}
            <motion.div
              className={cn(
                "w-full h-full cursor-pointer transition-all duration-300 ease-out flex items-center justify-center",
                "rounded-[4px] first-of-type:rounded-l-full last-of-type:rounded-r-full"
              )}
              style={{ backgroundColor: item.color }}
              animate={{
                opacity: hoveredCategory === null || hoveredCategory === item.category ? 1 : 0.25,
                scaleY: hoveredCategory === item.category ? 1.25 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            
            {/* High-Fidelity Tooltip on Hover */}
            <AnimatePresence>
              {hoveredCategory === item.category && (
                <ChartTooltip item={item} />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Unified Data Pane (Scrollable area) */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 relative">
        {data.map((item, i) => (
          <motion.div
            key={`list-${item.category}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + (i * 0.03) }}
            onMouseEnter={() => setHoveredCategory(item.category)}
            onMouseLeave={() => setHoveredCategory(null)}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 cursor-default border border-transparent",
              hoveredCategory === item.category 
                ? "bg-accent/80 border-accent shadow-sm translate-x-1" 
                : "hover:bg-accent/40"
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}40` }} 
                />
                <span className="text-[13px] font-medium tracking-tight truncate">{item.category}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[13px] font-mono font-semibold">
                  {formatINR(item.amount, true)}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono mt-0.5 tabular-nums">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Inline Mini Progress Bar */}
            <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden mt-1">
              <motion.div 
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
              />
            </div>
          </motion.div>
        ))}
        {/* End of list padding */}
        <div className="p-1" />
      </div>
    </motion.div>
  );
}