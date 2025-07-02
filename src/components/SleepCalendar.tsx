
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, Bed, Sun, FileText } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SleepRecord } from '../types/sleep';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

export function SleepCalendar() {
  const [sleepRecords] = useLocalStorage<SleepRecord[]>('sleep-records', []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<SleepRecord | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSleepRecordForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sleepRecords.find(record => record.date === dateStr);
  };

  const getSleepDurationColor = (duration: number) => {
    if (duration >= 8) return 'bg-green-500';
    if (duration >= 7) return 'bg-yellow-500';
    if (duration >= 6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getQualityEmoji = (quality?: string) => {
    switch (quality) {
      case 'excellent': return '😴';
      case 'good': return '😊';
      case 'fair': return '😐';
      case 'poor': return '😵';
      default: return '❓';
    }
  };

  const navigateToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const navigateToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Sleep Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={navigateToPreviousMonth}
                className="p-2 hover:bg-muted rounded"
              >
                ‹
              </button>
              <span className="font-medium">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button
                onClick={navigateToNextMonth}
                className="p-2 hover:bg-muted rounded"
              >
                ›
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const sleepRecord = getSleepRecordForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    p-2 min-h-[60px] border rounded cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-background' : 'bg-muted/30 text-muted-foreground'}
                    ${isCurrentDay ? 'ring-2 ring-primary' : ''}
                    ${sleepRecord ? 'hover:bg-muted/50' : ''}
                  `}
                  onClick={() => sleepRecord && setSelectedRecord(sleepRecord)}
                >
                  <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
                  
                  {sleepRecord && (
                    <div className="space-y-1">
                      <div className={`w-full h-2 rounded ${getSleepDurationColor(sleepRecord.sleepDuration)}`} />
                      <div className="flex items-center justify-between text-xs">
                        <span>{sleepRecord.sleepDuration.toFixed(1)}h</span>
                        <span>{getQualityEmoji(sleepRecord.sleepQuality)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>8+ hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>7-8 hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span>6-7 hours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span>&lt; 6 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sleep Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Sleep Details - {format(new Date(selectedRecord.date), 'MMM dd, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Bedtime</p>
                    <p className="text-sm text-muted-foreground">{selectedRecord.bedtime}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Wake Time</p>
                    <p className="text-sm text-muted-foreground">{selectedRecord.wakeTime}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Sleep Duration</p>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${getSleepDurationColor(selectedRecord.sleepDuration)}`} />
                  <span className="text-sm">{selectedRecord.sleepDuration.toFixed(1)} hours</span>
                </div>
              </div>
              
              {selectedRecord.sleepQuality && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sleep Quality</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getQualityEmoji(selectedRecord.sleepQuality)}</span>
                    <span className="text-sm capitalize">{selectedRecord.sleepQuality}</span>
                  </div>
                </div>
              )}
              
              {selectedRecord.notes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Notes
                  </p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}
              
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Close
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
