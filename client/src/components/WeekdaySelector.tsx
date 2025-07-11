
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WeekdaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
  disabled?: boolean;
}

const WEEKDAYS = [
  { value: 1, label: 'Mon', shortLabel: 'M' },
  { value: 2, label: 'Tue', shortLabel: 'T' },
  { value: 3, label: 'Wed', shortLabel: 'W' },
  { value: 4, label: 'Thu', shortLabel: 'T' },
  { value: 5, label: 'Fri', shortLabel: 'F' },
  { value: 6, label: 'Sat', shortLabel: 'S' },
  { value: 0, label: 'Sun', shortLabel: 'S' }
];

export function WeekdaySelector({ selectedDays, onChange, disabled = false }: WeekdaySelectorProps) {
  const toggleDay = (day: number) => {
    if (disabled) return;
    
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      onChange([...selectedDays, day].sort());
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">
        Select days of the week
      </div>
      
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS.map((weekday) => {
          const isSelected = selectedDays.includes(weekday.value);
          
          return (
            <Button
              key={weekday.value}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleDay(weekday.value)}
              disabled={disabled}
              className="min-w-[40px] h-8 p-1"
            >
              <span className="hidden sm:inline">{weekday.label}</span>
              <span className="sm:hidden">{weekday.shortLabel}</span>
            </Button>
          );
        })}
      </div>
      
      {selectedDays.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground">Selected:</span>
          {selectedDays.map(day => {
            const weekday = WEEKDAYS.find(w => w.value === day);
            return (
              <Badge key={day} variant="secondary" className="text-xs">
                {weekday?.label}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
