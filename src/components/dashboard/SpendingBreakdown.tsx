import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCategoryBreakdown } from '../../hooks/useFinancialMetrics';
import { formatINR } from '../../data/mockData';

export function SpendingBreakdown() {
  const data = useCategoryBreakdown();

  if (data.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5 flex items-center justify-center h-full text-sm text-muted-foreground">
        No expense data to display
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card rounded-xl p-5"
      data-testid="chart-spending-breakdown"
    >
      <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-4">
        Spending Breakdown
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Donut chart */}
        <div className="w-[180px] h-[180px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
                nameKey="category"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {data.slice(0, 6).map((item, i) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground truncate">{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">{item.percentage}%</span>
                <span className="text-muted-foreground font-mono">{formatINR(item.amount, true)}</span>
              </div>
            </motion.div>
          ))}
          {data.length > 6 && (
            <p className="text-[10px] text-muted-foreground text-center mt-1">+{data.length - 6} more categories</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-popover border border-popover-border rounded-lg p-2.5 shadow-lg text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="font-medium">{data.category}</span>
      </div>
      <p className="font-mono">{formatINR(data.amount)} ({data.percentage}%)</p>
    </div>
  );
}