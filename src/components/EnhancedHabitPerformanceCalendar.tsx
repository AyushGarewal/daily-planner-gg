
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
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

export function EnhancedHabitPerformanceCalendar() {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<string>('all');

  // Get habits only
  const habits = tasks.filter(task => task.type === 'habit');

  // Generate calendar data
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

  // Mock habit completion data - in real app this would come from database
  const getHabitCompletionForDate = (date: Date, habitId?: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const habitsForDate = habitId === 'all' || !habitId ? habits : habits.filter(h => h.id === habitId);
    
    return habitsForDate.map(habit => ({
      habitId: habit.id,
      habitTitle: habit.title,
      completed: Math.random() > 0.3, // Mock data - replace with real completion status
      dateStr
    }));
  };

  const getDayCompletionStats = (date: Date) => {
    const completions = getHabitCompletionForDate(date, selectedHabit);
    const total = completions.length;
    const completed = completions.filter(c => c.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  const getDayStatusColor = (date: Date) => {
    if (!isSameMonth(date, currentDate)) return 'text-gray-300';
    
    const stats = getDayCompletionStats(date);
    if (stats.total === 0) return 'text-gray-400';
    
    if (stats.percentage === 100) return 'bg-green-500 text-white';
    if (stats.percentage >= 50) return 'bg-yellow-400 text-white';
    if (stats.percentage > 0) return 'bg-red-400 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedDateCompletions = selectedDate ? getHabitCompletionForDate(selectedDate, selectedHabit) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Habit Performance Calendar
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track your habit consistency over time
              </p>
            </div>
            
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
          {/* Habit Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Filter by habit:</span>
            <Button
              variant={selectedHabit === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedHabit('all')}
            >
              All Habits
            </Button>
            {habits.map(habit => (
              <Button
                key={habit.id}
                variant={selectedHabit === habit.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedHabit(habit.id)}
              >
                {habit.title}
              </Button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>100% Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>50%+ Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Not Done</span>
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
                const stats = getDayCompletionStats(date);
                const statusColor = getDayStatusColor(date);
                const todayClass = isToday(date) ? 'ring-2 ring-blue-500' : '';
                const isCurrentMonth = isSameMonth(date, currentDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`
                      h-10 w-10 rounded-lg text-xs font-medium transition-all duration-200
                      hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${statusColor} ${todayClass}
                      ${isCurrentMonth ? '' : 'opacity-40'}
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <span>{format(date, 'd')}</span>
                      {stats.total > 0 && (
                        <div className="w-1 h-1 bg-current rounded-full mt-0.5"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {calendarDays.filter(date => 
                  isSameMonth(date, currentDate) && getDayCompletionStats(date).percentage === 100
                ).length}
              </div>
              <div className="text-xs text-muted-foreground">Perfect Days</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {calendarDays.filter(date => 
                  isSameMonth(date, currentDate) && 
                  getDayCompletionStats(date).percentage >= 50 && 
                  getDayCompletionStats(date).percentage < 100
                ).length}
              </div>
              <div className="text-xs text-muted-foreground">Good Days</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {calendarDays.filter(date => 
                  isSameMonth(date, currentDate) && 
                  getDayCompletionStats(date).percentage > 0 && 
                  getDayCompletionStats(date).percentage < 50
                ).length}
              </div>
              <div className="text-xs text-muted-foreground">Partial Days</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">
                {calendarDays.filter(date => 
                  isSameMonth(date, currentDate) && getDayCompletionStats(date).percentage === 0
                ).length}
              </div>
              <div className="text-xs text-muted-foreground">Missed Days</div>
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
            {selectedDateCompletions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No habits tracked on this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Habit completion status for this day:
                </div>
                
                {selectedDateCompletions.map(completion => (
                  <div 
                    key={`${completion.habitId}-${completion.dateStr}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium">{completion.habitTitle}</span>
                    <div className="flex items-center gap-2">
                      {completion.completed ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          <X className="h-3 w-3 mr-1" />
                          Missed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Completion Rate: {Math.round(
                      (selectedDateCompletions.filter(c => c.completed).length / selectedDateCompletions.length) * 100
                    )}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
