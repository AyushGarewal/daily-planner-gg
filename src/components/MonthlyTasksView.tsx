import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, List, Grid } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from './TaskCard';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  getDaysInMonth,
  getDay,
  startOfWeek
} from 'date-fns';

export function MonthlyTasksView() {
  const { tasks, completeTask, deleteTask, toggleSubtask } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get all calendar days including padding for week display
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfMonth(addMonths(monthStart, 0));
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Pad to complete weeks
  const totalCalendarDays = Math.ceil(calendarDays.length / 7) * 7;
  const paddedCalendarDays = [...calendarDays];
  while (paddedCalendarDays.length < totalCalendarDays) {
    paddedCalendarDays.push(new Date(paddedCalendarDays[paddedCalendarDays.length - 1].getTime() + 24 * 60 * 60 * 1000));
  }

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return tasks.filter(task => new Date(task.dueDate).toDateString() === dateStr);
  };

  const getMonthlyTasks = () => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameMonth(taskDate, currentDate);
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const getTaskStats = () => {
    const monthlyTasks = getMonthlyTasks();
    const completed = monthlyTasks.filter(task => task.completed).length;
    const total = monthlyTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, completionRate };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate);

  const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
    toggleSubtask(taskId, subtaskId);
  };

  const stats = getTaskStats();
  const monthlyTasks = getMonthlyTasks();

  const renderCalendarDay = (date: Date, dayIndex: number) => {
    const dayTasks = getTasksForDate(date);
    const isInCurrentMonth = isCurrentMonth(date);
    const todayClass = isToday(date) ? 'bg-primary text-primary-foreground' : '';
    const monthClass = isInCurrentMonth ? '' : 'opacity-30';
    
    return (
      <div
        key={dayIndex}
        className={`min-h-[120px] border border-gray-100 dark:border-gray-800 p-2 ${monthClass}`}
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${todayClass}`}>
          {format(date, 'd')}
        </div>
        
        <div className="space-y-1">
          {dayTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${
                task.completed 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                  : task.priority === 'High' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : task.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}
              title={task.title}
            >
              {task.completed && '✓ '}{task.title}
            </div>
          ))}
          
          {dayTasks.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{dayTasks.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  const groupTasksByDate = () => {
    const grouped = monthlyTasks.reduce((acc, task) => {
      const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-500" />
            Monthly Tasks
          </h2>
          <p className="text-muted-foreground">
            {format(currentDate, 'MMMM yyyy')} • {stats.total} tasks • {stats.completionRate}% complete
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
              {format(currentDate, 'MMM yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <List className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'calendar' | 'list')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="grid grid-cols-7 gap-0 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 gap-0">
                {paddedCalendarDays.slice(0, 42).map((date, index) => renderCalendarDay(date, index))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          {monthlyTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No tasks this month</h3>
              <p className="text-sm">Tasks for {format(currentDate, 'MMMM yyyy')} will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupTasksByDate().map(([dateKey, dateTasks]) => (
                <div key={dateKey}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">
                      {format(new Date(dateKey), 'EEEE, MMMM d')}
                    </h3>
                    {isToday(new Date(dateKey)) && (
                      <Badge variant="secondary">Today</Badge>
                    )}
                    <Badge variant="outline">
                      {dateTasks.length} task{dateTasks.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    {dateTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                        onEdit={setEditingTask}
                        onDelete={deleteTask}
                        onSubtaskToggle={handleSubtaskToggle}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
