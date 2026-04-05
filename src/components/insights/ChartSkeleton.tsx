import { motion } from 'framer-motion';

export function ChartSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass-card rounded-xl p-5 flex flex-col h-[280px] w-full"
    >
      <div className="w-1/3 max-w-[150px] h-3 bg-muted/40 rounded-full animate-pulse mb-6 flex-shrink-0" />
      
      <div className="flex-1 flex flex-col justify-between gap-4 py-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full flex items-center gap-3">
            <div className="w-1/4 h-2.5 bg-muted/30 rounded-full animate-pulse" />
            <div className="flex-1 h-3 bg-muted/20 rounded-full overflow-hidden relative">
               <motion.div 
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent skew-x-12 w-full"
                 animate={{ x: ['-100%', '200%'] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: 'linear', delay: i * 0.1 }}
               />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
