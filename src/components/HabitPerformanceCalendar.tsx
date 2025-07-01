
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle2, Circle, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isAfter, isBefore, startOfWeek, isToday, isSameMonth } from 'date-fns';

export function HabitPerformanceCalendar() {
  const { tasks } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHabit, setSelectedHabit] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get unique habits
  const habits = tasks.filter(task => task.type === 'habit')
    .reduce((acc, task) => {
      const existingHabit = acc.find(h => h.title === task.title && h.category === task.category);
      if (!existingHabit) {
        acc.push(task);
      }
      return acc;
    }, [] as any[]);

  const selectedHabitData = habits.find(h => h.id === selectedHabit);
  
  // Get calendar days for full month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
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

  // Get habit creation date
  const getHabitCreationDate = (habit: any) => {
    const habitTasks = tasks.filter(t => 
      t.type === 'habit' && 
      t.title === habit.title && 
      t.category === habit.category
    );
    
    if (habitTasks.length === 0) return new Date();
    
    // Find the earliest task date
    return habitTasks.reduce((earliest, task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate < earliest ? taskDate : earliest;
    }, new Date(habitTasks[0].dueDate));
  };

  // Check if habit was completed on a specific date
  const isHabitCompletedOnDate = (habit: any, date: Date) => {
    return tasks.some(task => 
      task.type === 'habit' &&
      task.title === habit.title &&
      task.category === habit.category &&
      isSameDay(new Date(task.dueDate), date) &&
      task.completed
    );
  };

  // Check if habit was scheduled for a specific date
  const isHabitScheduledOnDate = (habit: any, date: Date) => {
    if (!habit) return false;
    
    const creationDate = getHabitCreationDate(habit);
    if (isBefore(date, creationDate)) return false;
    
    if (habit.recurrence === 'Daily') {
      return true;
    }
    
    if (habit.recurrence === 'Weekly' && habit.weekDays) {
      const dayOfWeek = date.getDay();
      return habit.weekDays.includes(dayOfWeek);
    }
    
    return false;
  };

  const getDayStatus = (habit: any, date: Date) => {
    if (!habit) return 'not-scheduled';
    
    const scheduled = isHabitScheduledOnDate(habit, date);
    if (!scheduled) return 'not-scheduled';
    
    const completed = isHabitCompletedOnDate(habit, date);
    const isDateToday = isSameDay(date, new Date());
    const isFuture = isAfter(date, new Date());
    
    if (isFuture) return 'future';
    if (completed) return 'completed';
    if (isDateToday) return 'today';
    return 'missed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'missed': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'today': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'future': return 'bg-gray-200 hover:bg-gray-300 text-gray-600';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-3 w-3" />;
      case 'missed': return <X className="h-3 w-3" />;
      case 'today': return <Circle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getMonthStats = (habit: any) => {
    if (!habit) return { completed: 0, missed: 0, total: 0 };
    
    let completed = 0;
    let missed = 0;
    let total = 0;
    
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    monthDays.forEach(date => {
      const status = getDayStatus(habit, date);
      if (status === 'completed') {
        completed++;
        total++;
      } else if (status === 'missed') {
        missed++;
        total++;
      } else if (status === 'today') {
        total++;
      }
    });
    
    return { completed, missed, total };
  };

  const stats = selectedHabitData ? getMonthStats(selectedHabitData) : { completed: 0, missed: 0, total: 0 };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleDateClick = (date: Date) => {
    if (getDayStatus(selectedHabitData, date) !== 'not-scheduled') {
      setSelectedDate(date);
    }
  };

  const getSelectedDateInfo = () => {
    if (!selectedDate || !selectedHabitData) return null;
    
    const status = getDayStatus(selectedHabitData, selectedDate);
    const scheduled = isHabitScheduledOnDate(selectedHabitData, selectedDate);
    
    return {
      date: selectedDate,
      habit: selectedHabitData,
      status,
      scheduled,
      statusText: {
        'completed': 'Completed ✅',
        'missed': 'Missed ❌',
        'today': 'Due Today 📅',
        'future': 'Scheduled 📋',
        'not-scheduled': 'Not Scheduled'
      }[status] || 'Unknown'
    };
  };

  const selectedDateInfo = getSelectedDateInfo();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Habit Performance Calendar
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Today
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[140px] text-center">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Habit Selector */}
            <div>
              <Select value={selectedHabit} onValueChange={setSelectedHabit}>
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="Select a habit to track" />
                </SelectTrigger>
                <SelectContent>
                  {habits.map((habit) => (
                    <SelectItem key={habit.id} value={habit.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{habit.title}</span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {habit.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stats Bar */}
            {selectedHabitData && (
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completed: {stats.completed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Missed: {stats.missed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {completionRate}% completion rate
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {!selectedHabit ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a habit to view calendar</h3>
              <p className="text-sm">Choose a habit from the dropdown to see its performance history</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                    const status = getDayStatus(selectedHabitData, date);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const todayClass = isToday(date) ? 'ring-2 ring-primary ring-offset-1' : '';
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        className={`
                          relative p-2 h-12 w-full rounded-lg text-xs font-medium transition-all
                          ${getStatusColor(status)}
                          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                          ${todayClass}
                          ${status === 'not-scheduled' ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                          ${isCurrentMonth ? '' : 'opacity-40'}
                        `}
                        disabled={status === 'not-scheduled'}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="mb-1">{format(date, 'd')}</span>
                          <div className="absolute top-1 right-1">
                            {getStatusIcon(status)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Missed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>Future</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Not Scheduled</span>
                </div>
              </div>

              {/* Selected Date Info */}
              {selectedDateInfo && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">
                    {format(selectedDateInfo.date, 'EEEE, MMMM d, yyyy')}
                  </h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      <strong>{selectedDateInfo.habit.title}</strong>: {selectedDateInfo.statusText}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {selectedDateInfo.habit.category}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
