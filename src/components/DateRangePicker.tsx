
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const start = isValid(parseISO(startDate)) ? parseISO(startDate) : new Date();
  const end = isValid(parseISO(endDate)) ? parseISO(endDate) : new Date();

  const handleDateClick = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    if (!startDate || (startDate && endDate)) {
      onStartDateChange(dayStr);
      onEndDateChange('');
    } else if (startDate && !endDate) {
      if (day < parseISO(startDate)) {
        onStartDateChange(dayStr);
        onEndDateChange(startDate);
      } else {
        onEndDateChange(dayStr);
        setIsOpen(false);
      }
    }
  };

  const setQuickRange = (days: number) => {
    const endRange = new Date();
    const startRange = new Date();
    startRange.setDate(endRange.getDate() - days);
    
    onStartDateChange(format(startRange, 'yyyy-MM-dd'));
    onEndDateChange(format(endRange, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const setRangeToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    onStartDateChange(today);
    onEndDateChange(today);
    setIsOpen(false);
  };

  const setRangeMonth = () => {
    const today = new Date();
    const startRange = startOfMonth(today);
    onStartDateChange(format(startRange, 'yyyy-MM-dd'));
    onEndDateChange(format(today, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDateCal = startOfWeek(monthStart);
    const endDateCal = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDateCal, end: endDateCal });

    return (
      <div className="grid grid-cols-7 gap-1 mt-4">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
          <div key={`${day}-${idx}`} className="text-[10px] font-black text-gray-400 text-center py-1">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, start) || (endDate && isSameDay(day, end));
          const isInRange = endDate && isWithinInterval(day, { start, end });
          const isOutsideMonth = !isSameMonth(day, monthStart);

          return (
            <button
              key={idx}
              onClick={() => handleDateClick(day)}
              className={`
                h-8 w-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative
                ${isOutsideMonth ? 'text-gray-300 dark:text-gray-700' : 'text-gray-700 dark:text-gray-200'}
                ${isSelected ? 'bg-blue-600 text-white z-10' : ''}
                ${isInRange && !isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : ''}
                ${!isSelected && !isInRange ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3" ref={dropdownRef}>
      {/* Quick Select Buttons */}
      <div className="flex bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <button 
          onClick={setRangeToday}
          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
        >
          Hoje
        </button>
        <button 
          onClick={() => setQuickRange(7)}
          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
        >
          7D
        </button>
        <button 
          onClick={() => setQuickRange(30)}
          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
        >
          30D
        </button>
        <button 
          onClick={setRangeMonth}
          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
        >
          Mês
        </button>
      </div>

      {/* Date Range Dropdown Trigger */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center bg-white dark:bg-gray-900 rounded-xl border shadow-sm px-4 py-2 gap-3 transition-all outline-none
            ${isOpen ? 'border-blue-600 ring-4 ring-blue-50 dark:ring-blue-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900'}
          `}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-black text-gray-400 uppercase leading-none">Período</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {format(start, 'dd/MM/yyyy')} — {endDate ? format(end, 'dd/MM/yyyy') : '...'}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5 z-50 min-w-[300px]"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {renderCalendar()}

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    onStartDateChange('');
                    onEndDateChange('');
                  }}
                  className="text-[10px] font-black text-rose-500 uppercase tracking-wider hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1 rounded-lg transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Aplicar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

