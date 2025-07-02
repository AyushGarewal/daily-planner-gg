
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Moon, Sun, Clock } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SleepRecord } from '../types/sleep';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

export function SleepCalendar() {
  const [sleepRecords, setSleepRecords] = useLocalStorage<SleepRecord[]>('sleepRecords', []);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SleepRecord | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSleepRecordForDate = (date: Date): SleepRecord | null => {
    return sleepRecords.find(record => 
      isSameDay(new Date(record.date), date)
    ) || null;
  };

  const getSleepDurationColor = (duration: number): string => {
    if (duration >= 8) return 'bg-green-500';
    if (duration >= 7) return 'bg-yellow-500';
    if (duration >= 6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSleepQualityEmoji = (quality?: 'poor' | 'fair' | 'good' | 'excellent'): string => {
    switch (quality) {
      case 'excellent': return '😴';
      case 'good': return '😊';
      case 'fair': return '😐';
      case 'poor': return '😵';
      default: return '❓';
    }
  };

  const handleDateClick = (date: Date) => {
    const record = getSleepRecordForDate(date);
    if (record) {
      setSelectedDate(date);
      setSelectedRecord(record);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Sleep Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium p-2 text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((date) => {
              const record = getSleepRecordForDate(date);
              const isToday = isSameDay(date, new Date());
              
              return (
                <div
                  key={date.toISOString()}
                  className={`
                    relative p-2 text-center text-sm border rounded cursor-pointer
                    transition-colors hover:bg-muted/50 min-h-[60px] flex flex-col justify-center items-center
                    ${isToday ? 'border-primary bg-primary/10' : 'border-border'}
                    ${record ? 'hover:bg-muted/70' : ''}
                  `}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="font-medium">{format(date, 'd')}</div>
                  
                  {record && (
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <div
                        className={`w-3 h-3 rounded-full ${getSleepDurationColor(record.sleepDuration)}`}
                        title={`${record.sleepDuration}h sleep`}
                      />
                      <div className="text-xs">
                        {getSleepQualityEmoji(record.sleepQuality)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>8+ hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>7-8 hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>6-7 hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>&lt;6 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sleep Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Sleep Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && selectedDate && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {format(selectedDate, 'EEEE, MMMM dd')}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Moon className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm text-muted-foreground">Bedtime</div>
                  <div className="font-semibold">{selectedRecord.bedtime}</div>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Sun className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
                  <div className="text-sm text-muted-foreground">Wake Time</div>
                  <div className="font-semibold">{selectedRecord.wakeTime}</div>
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 mx-auto mb-2 text-green-500" />
                <div className="text-sm text-muted-foreground">Sleep Duration</div>
                <div className="font-semibold">{selectedRecord.sleepDuration} hours</div>
              </div>
              
              {selectedRecord.sleepQuality && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl mb-2">
                    {getSleepQualityEmoji(selectedRecord.sleepQuality)}
                  </div>
                  <div className="text-sm text-muted-foreground">Sleep Quality</div>
                  <Badge variant="outline" className="capitalize">
                    {selectedRecord.sleepQuality}
                  </Badge>
                </div>
              )}
              
              {selectedRecord.notes && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Notes</div>
                  <div className="text-sm">{selectedRecord.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
