
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WeekdaySelector } from './WeekdaySelector';

interface RecurrenceSelectorProps {
  recurrence: 'None' | 'Daily' | 'Weekly' | 'Custom';
  onRecurrenceChange: (recurrence: 'None' | 'Daily' | 'Weekly' | 'Custom') => void;
  weekDays?: number[];
  onWeekDaysChange: (days: number[]) => void;
  customFrequency?: number;
  onCustomFrequencyChange: (frequency: number) => void;
  taskType: 'task' | 'habit';
}

export function RecurrenceSelector({
  recurrence,
  onRecurrenceChange,
  weekDays = [],
  onWeekDaysChange,
  customFrequency = 1,
  onCustomFrequencyChange,
  taskType
}: RecurrenceSelectorProps) {
  if (taskType !== 'habit') {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium mb-2">Recurrence Frequency</Label>
        <Select value={recurrence} onValueChange={onRecurrenceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select recurrence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="None">One-time only</SelectItem>
            <SelectItem value="Daily">Every day</SelectItem>
            <SelectItem value="Weekly">Specific days of week</SelectItem>
            <SelectItem value="Custom">Custom times per week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {recurrence === 'Weekly' && (
        <div>
          <Label className="block text-sm font-medium mb-2">Select Days</Label>
          <WeekdaySelector
            selectedDays={weekDays}
            onChange={onWeekDaysChange}
          />
          {weekDays.length === 0 && (
            <p className="text-sm text-red-500 mt-1">Please select at least one day</p>
          )}
        </div>
      )}

      {recurrence === 'Custom' && (
        <div>
          <Label className="block text-sm font-medium mb-2">Times per week</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              max="7"
              value={customFrequency}
              onChange={(e) => onCustomFrequencyChange(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">times per week</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            The habit will be automatically distributed across the week
          </p>
        </div>
      )}

      {recurrence === 'Daily' && (
        <p className="text-sm text-muted-foreground">
          This habit will appear every day
        </p>
      )}
    </div>
  );
}
