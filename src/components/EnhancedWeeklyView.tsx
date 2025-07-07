
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ArrowUpDown, ArrowUp, ArrowDown, Clock, CheckCircle, Circle } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/task';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';

type SortOrder = 'desc' | 'asc';
type SortBy = 'date' | 'completion' | 'xp';

export function EnhancedWeeklyView() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const { tasks, completeTask } = useTasks();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Sunday
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const getDayData = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    const completedTasks = dayTasks.filter(task => task.completed);
    const totalXP = completedTasks.reduce((sum, task) => sum + (task.xpValue || 0), 0);
    const completionRate = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0;
    
    return {
      date,
      tasks: dayTasks,
      completedTasks: completedTasks.length,
      totalTasks: dayTasks.length,
      completionRate,
      totalXP
    };
  };

  const weekData = weekDays.map(getDayData);

  const sortedWeekData = [...weekData].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = a.date.getTime() - b.date.getTime();
        break;
      case 'completion':
        comparison = a.completionRate - b.completionRate;
        break;
      case 'xp':
        comparison = a.totalXP - b.totalXP;
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(prev => subWeeks(prev, 1));
    } else {
      setCurrentWeek(prev => addWeeks(prev, 1));
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const getSortIcon = () => {
    if (sortOrder === 'desc') {
      return <ArrowDown className="h-4 w-4" />;
    }
    return <ArrowUp className="h-4 w-4" />;
  };

  const handleTaskComplete = (taskId: string) => {
    completeTask(taskId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(new Date())}
            >
              This Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              Next
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
          </p>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="xp">XP Earned</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="flex items-center gap-2"
            >
              {getSortIcon()}
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {sortedWeekData.map((dayData) => (
            <Card key={dayData.date.toISOString()} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {format(dayData.date, 'EEEE, MMM dd')}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {dayData.completedTasks}/{dayData.totalTasks} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {dayData.totalXP} XP
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={dayData.completionRate === 100 ? "default" : "secondary"}
                      className="text-sm"
                    >
                      {Math.round(dayData.completionRate)}% Complete
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {dayData.tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks scheduled for this day
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dayData.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6"
                          onClick={() => handleTaskComplete(task.id)}
                        >
                          {task.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                            <span>•</span>
                            <span>{task.xpValue || 0} XP</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        {task.subtasks && task.subtasks.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
