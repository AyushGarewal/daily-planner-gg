
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Droplets, Utensils, Heart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface WellnessLog {
  date: string;
  waterIntake: number;
  calorieIntake: number;
}

export function WellnessCalendar() {
  const [wellnessLogs] = useLocalStorage<WellnessLog[]>('wellnessLogs', []);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getLogForDate = (date: Date) => {
    return wellnessLogs.find(log => log.date === date.toDateString());
  };

  const getDayColor = (date: Date) => {
    const log = getLogForDate(date);
    if (!log) return 'bg-gray-100';
    
    const hasWater = log.waterIntake > 0;
    const hasCalories = log.calorieIntake > 0;
    
    if (hasWater && hasCalories) return 'bg-green-200';
    if (hasWater || hasCalories) return 'bg-yellow-200';
    return 'bg-gray-100';
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedDateLog = selectedDate ? getLogForDate(selectedDate) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Wellness Calendar
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-32 text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before month start */}
            {Array.from({ length: monthStart.getDay() }, (_, i) => (
              <div key={`empty-${i}`} className="p-2"></div>
            ))}
            
            {/* Calendar days */}
            {daysInMonth.map(date => {
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const log = getLogForDate(date);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`
                    relative p-2 h-10 w-10 rounded-lg text-sm font-medium transition-all
                    ${getDayColor(date)} hover:opacity-75
                    ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                  `}
                >
                  <span className="text-gray-800">
                    {format(date, 'd')}
                  </span>
                  {log && (
                    <div className="absolute bottom-0 right-0 flex gap-1">
                      {log.waterIntake > 0 && (
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      )}
                      {log.calorieIntake > 0 && (
                        <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>Both Logged</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 rounded"></div>
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span>No Data</span>
            </div>
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h4>
              {selectedDateLog ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      {selectedDateLog.waterIntake} ml water
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">
                      {selectedDateLog.calorieIntake} calories
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No wellness data logged for this day</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
