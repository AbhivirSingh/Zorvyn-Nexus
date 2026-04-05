import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';

type Preset = '7d' | 'this_month' | 'ytd' | 'all' | 'custom';

const PRESETS = [
  { id: '7d', label: '7 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'ytd', label: 'YTD' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom' },
] as const;

function getPresetRange(preset: Preset): { start: string; end: string } | null {
  const now = new Date(2026, 3, 5); // Base reference to April 5, 2026 for consistency with mock data
  
  if (preset === 'all') return null;
  if (preset === '7d') {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return { start: start.toISOString(), end: now.toISOString() };
  }
  if (preset === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: start.toISOString(), end: now.toISOString() };
  }
  if (preset === 'ytd') {
    const start = new Date(now.getFullYear(), 0, 1);
    return { start: start.toISOString(), end: now.toISOString() };
  }
  return null;
}

export function DateRangePicker({ onRangeChange }: { onRangeChange: () => void }) {
  const [activePreset, setActivePreset] = useState<Preset>('all');
  const setInsightsDateRange = useStore((s) => s.setInsightsDateRange);

  const handlePresetClick = (preset: Preset) => {
    if (activePreset === preset) return; // Ignore clicking same preset
    setActivePreset(preset);
    
    if (preset !== 'custom') {
      setInsightsDateRange(getPresetRange(preset));
      onRangeChange();
    }
  };

  const handleCustomApply = (start: Date, end: Date) => {
    setInsightsDateRange({ start: start.toISOString(), end: end.toISOString() });
    onRangeChange();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="inline-flex items-center p-1 bg-muted/30 rounded-xl overflow-hidden self-start">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.id as Preset)}
            className={cn(
              "relative px-4 py-1.5 text-xs font-medium rounded-lg transition-colors z-10",
              activePreset === preset.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            )}
          >
            {activePreset === preset.id && (
              <motion.div
                layoutId="active-preset-pill"
                className="absolute inset-0 bg-background shadow-sm rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {preset.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {activePreset === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="self-start origin-top"
          >
            <CustomCalendar onApply={handleCustomApply} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomCalendar({ onApply }: { onApply: (start: Date, end: Date) => void }) {
  const today = new Date(2026, 3, 5); // April 2026 context
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handleDateClick = (daySequence: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), daySequence);
    if (!start || (start && end)) {
      setStart(clickedDate);
      setEnd(null);
    } else {
      if (clickedDate < start) {
        setStart(clickedDate);
      } else {
        setEnd(clickedDate);
      }
    }
  };

  const isSelected = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getTime();
    return d === start?.getTime() || d === end?.getTime();
  };

  const isInRange = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getTime();
    if (start && end) return d > start.getTime() && d < end.getTime();
    if (start && hoverDate && !end) {
      if (hoverDate > start) return d > start.getTime() && d < hoverDate.getTime();
      if (hoverDate < start) return d < start.getTime() && d > hoverDate.getTime();
    }
    return false;
  };

  return (
    <div className="glass-card p-4 rounded-xl border border-border shadow-lg flex flex-col w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-md text-muted-foreground"><ChevronLeft size={16} /></button>
        <span className="text-sm font-medium">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-md text-muted-foreground"><ChevronRight size={16} /></button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-[10px] uppercase font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {Array.from({ length: firstDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selected = isSelected(day);
          const range = isInRange(day);
          
          return (
            <div key={day} className="relative py-0.5">
              {range && <div className="absolute inset-y-0 left-0 right-0 bg-primary/20 pointer-events-none" />}
              {selected && start && !end && hoverDate && hoverDate > start && <div className="absolute inset-y-0 left-1/2 right-0 bg-primary/20 pointer-events-none" />}
              {selected && start && !end && hoverDate && hoverDate < start && <div className="absolute inset-y-0 right-1/2 left-0 bg-primary/20 pointer-events-none" />}
              {selected && end && day === start?.getDate() && <div className="absolute inset-y-0 left-1/2 right-0 bg-primary/20 pointer-events-none" />}
              {selected && end && day === end?.getDate() && <div className="absolute inset-y-0 right-1/2 left-0 bg-primary/20 pointer-events-none" />}
              
              <button
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => setHoverDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                onMouseLeave={() => setHoverDate(null)}
                className={cn(
                  "relative z-10 w-7 h-7 mx-auto flex items-center justify-center rounded-full text-xs font-medium transition-colors",
                  selected ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted text-foreground"
                )}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-1 break-words">
           <CalendarIcon size={12} />
           {start ? start.toLocaleDateString() : 'Start'} - {end ? end.toLocaleDateString() : 'End'}
        </div>
        <Button 
          size="sm" 
          disabled={!start || !end} 
          onClick={() => { if (start && end) onApply(start, end) }}
          className="h-7 px-3 text-xs w-[72px]"
        >
          {start && end ? "Apply" : "Select"}
        </Button>
      </div>
    </div>
  );
}
