
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight, Moon, Sun, Clock } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SleepRecord } from '../types/sleep';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  isToday,
  parseISO
} from 'date-fns';

export function SleepCalendar() {
  const [sleepRecords] = useLocalStorage<SleepRecord[]>('sleepRecords', []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  
  // Create full calendar grid (6 weeks)
  const calendarDays: Date[] = [];
  let currentCalendarDate = new Date(calendarStart);
  
  for (let week = 0; week < 6; week++) {
    for (let day = 0; day < 7; day++) {
      calendarDays.push(new Date(currentCalendarDate));
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }
  }

  const getSleepDataForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sleepRecords.find(record => record.date === dateStr);
  };

  const getDurationColor = (duration: number) => {
    if (duration >= 8) return 'bg-green-500';
    if (duration >= 7) return 'bg-blue-500';
    if (duration >= 6) return 'bg-yellow-500';
    if (duration >= 5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-600';
      case 'good': return 'bg-blue-600';
      case 'fair': return 'bg-yellow-600';
      case 'poor': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return '😴';
      case 'good': return '😊';
      case 'fair': return '😐';
      case 'poor': return '😫';
      default: return '💤';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const selectedDateSleep = selectedDate ? getSleepDataForDate(selectedDate) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-blue-500" />
              Sleep Calendar
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>8+ hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>7-8 hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>6-7 hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>5-6 hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>&lt;5 hours</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const sleepData = getSleepDataForDate(date);
                const todayClass = isToday(date) ? 'ring-2 ring-blue-500' : '';
                const isCurrentMonth = isSameMonth(date, currentDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      relative h-16 w-full rounded-lg text-xs font-medium transition-all duration-200
                      hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${todayClass} border border-gray-200
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-50'}
                    `}
                  >
                    <div className="p-1 h-full flex flex-col">
                      <span className="text-gray-700">{format(date, 'd')}</span>
                      
                      {sleepData && (
                        <div className="flex-1 flex flex-col gap-1 mt-1">
                          <div className={`h-3 w-full rounded ${getDurationColor(sleepData.sleepDuration)}`} 
                               title={`${sleepData.sleepDuration}h sleep`}></div>
                          
                          <div className="flex justify-center">
                            <span className="text-xs" title={sleepData.sleepQuality}>
                              {getQualityIcon(sleepData.sleepQuality || 'good')}
                            </span>
                          </div>
                          
                          <div className="text-[10px] text-gray-600 leading-none">
                            {sleepData.sleepDuration}h
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Detail Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDateSleep ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Moon className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                    <div className="font-medium">Bedtime</div>
                    <div className="text-lg font-bold">{selectedDateSleep.bedtime}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Sun className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                    <div className="font-medium">Wake Time</div>
                    <div className="text-lg font-bold">{selectedDateSleep.wakeTime}</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-green-500" />
                  <div className="font-medium">Sleep Duration</div>
                  <div className="text-2xl font-bold">{selectedDateSleep.sleepDuration}h</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">Sleep Quality</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getQualityIcon(selectedDateSleep.sleepQuality || 'good')}</span>
                    <Badge className={`${getQualityColor(selectedDateSleep.sleepQuality || 'good')} text-white border-none`}>
                      {selectedDateSleep.sleepQuality}
                    </Badge>
                  </div>
                </div>

                {selectedDateSleep.notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-2">Notes</div>
                    <p className="text-sm text-muted-foreground">{selectedDateSleep.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Moon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No sleep data for this date</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
