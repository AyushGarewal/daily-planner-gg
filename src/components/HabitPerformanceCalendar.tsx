
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle2, Circle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isAfter, isBefore } from 'date-fns';

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
  
  // Get all days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
    const isToday = isSameDay(date, new Date());
    const isFuture = isAfter(date, new Date());
    
    if (isFuture) return 'future';
    if (completed) return 'completed';
    if (isToday) return 'today';
    return 'missed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 hover:bg-green-600';
      case 'missed': return 'bg-red-500 hover:bg-red-600';
      case 'today': return 'bg-blue-500 hover:bg-blue-600';
      case 'future': return 'bg-gray-200 hover:bg-gray-300';
      default: return 'bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-3 w-3 text-white" />;
      case 'missed': return <X className="h-3 w-3 text-white" />;
      case 'today': return <Circle className="h-3 w-3 text-white" />;
      default: return null;
    }
  };

  const getMonthStats = (habit: any) => {
    if (!habit) return { completed: 0, missed: 0, total: 0 };
    
    let completed = 0;
    let missed = 0;
    let total = 0;
    
    daysInMonth.forEach(date => {
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
    setSelectedDate(date);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Habit Performance Calendar
            </CardTitle>
            
            <div className="flex items-center gap-4">
              {/* Habit Selector */}
              <Select value={selectedHabit} onValueChange={setSelectedHabit}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select a habit" />
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

              {/* Month Navigation */}
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
          </div>

          {/* Stats Bar */}
          {selectedHabitData && (
            <div className="flex items-center gap-4 mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Completed: {stats.completed}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Missed: {stats.missed}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{completionRate}% completion rate</Badge>
              </div>
            </div>
          )}
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
                  const status = getDayStatus(selectedHabitData, date);
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateClick(date)}
                      className={`
                        relative p-2 h-10 w-10 rounded-lg text-sm font-medium transition-all
                        ${getStatusColor(status)} 
                        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                        ${status === 'not-scheduled' ? 'cursor-default' : 'cursor-pointer'}
                      `}
                      disabled={status === 'not-scheduled'}
                    >
                      <span className={status === 'not-scheduled' ? 'text-muted-foreground' : 'text-white'}>
                        {format(date, 'd')}
                      </span>
                      <div className="absolute top-0 right-0">
                        {getStatusIcon(status)}
                      </div>
                    </button>
                  );
                })}
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
