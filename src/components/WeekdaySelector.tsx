
import React from 'react';
import { Button } from '@/components/ui/button';

interface WeekdaySelectorProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
  disabled?: boolean;
}

const WEEKDAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export function WeekdaySelector({ selectedDays, onDaysChange, disabled }: WeekdaySelectorProps) {
  const toggleDay = (day: number) => {
    if (disabled) return;
    
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter(d => d !== day));
    } else {
      onDaysChange([...selectedDays, day].sort());
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Repeat on days</label>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <Button
            key={day.value}
            type="button"
            variant={selectedDays.includes(day.value) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleDay(day.value)}
            disabled={disabled}
            className="h-8 px-1 text-xs"
          >
            {day.label}
          </Button>
        ))}
      </div>
      {selectedDays.length === 0 && (
        <p className="text-xs text-muted-foreground">Select at least one day</p>
      )}
    </div>
  );
}
