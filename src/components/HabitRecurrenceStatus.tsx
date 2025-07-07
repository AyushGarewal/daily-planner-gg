
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Repeat, Clock } from 'lucide-react';
import { Task } from '../types/task';

interface HabitRecurrenceStatusProps {
  habit: Task;
  className?: string;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitRecurrenceStatus({ habit, className = '' }: HabitRecurrenceStatusProps) {
  if (habit.type !== 'habit' || habit.recurrence === 'None') {
    return null;
  }

  const getRecurrenceText = () => {
    switch (habit.recurrence) {
      case 'Daily':
        return 'Every day';
      case 'Weekly':
        if (habit.weekDays && habit.weekDays.length > 0) {
          const dayNames = habit.weekDays
            .sort((a, b) => a - b)
            .map(day => WEEKDAY_NAMES[day])
            .join(', ');
          return `Weekly: ${dayNames}`;
        }
        return 'Weekly';
      case 'Custom':
        return `${habit.customFrequency || 1}x per week`;
      default:
        return '';
    }
  };

  const getRecurrenceIcon = () => {
    switch (habit.recurrence) {
      case 'Daily':
        return <Calendar className="h-3 w-3" />;
      case 'Weekly':
        return <Repeat className="h-3 w-3" />;
      case 'Custom':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getBadgeVariant = () => {
    if (habit.isRecurringInstance) {
      return 'secondary';
    }
    return 'outline';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={getBadgeVariant()} className="text-xs flex items-center gap-1">
        {getRecurrenceIcon()}
        {getRecurrenceText()}
      </Badge>
      {habit.isRecurringInstance && (
        <Badge variant="secondary" className="text-xs">
          Auto-generated
        </Badge>
      )}
    </div>
  );
}
