
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Circle, Calendar, Target } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Routine } from '../types/routine';
import { Task } from '../types/task';
import { format, isSameDay, getDay } from 'date-fns';

interface RoutineTaskIntegrationProps {
  routineId?: string;
  showInTodayView?: boolean;
}

export function RoutineTaskIntegration({ routineId, showInTodayView = false }: RoutineTaskIntegrationProps) {
  const { tasks, addTask, completeTask } = useTasks();
  const [routines] = useLocalStorage<Routine[]>('routines', []);
  
  // Generate routine tasks for active routines
  useEffect(() => {
    const today = new Date();
    const todayWeekday = getDay(today);
    
    routines.forEach(routine => {
      if (!routine.active || !routine.daysOfWeek.includes(todayWeekday)) return;
      
      routine.habits.forEach(routineHabit => {
        // Check if task already exists for today
        const existingTask = tasks.find(task => 
          task.isRoutine && 
          task.routineName === routine.name &&
          task.title === routineHabit.title &&
          isSameDay(new Date(task.dueDate), today)
        );
        
        if (!existingTask) {
          // Create routine task for today
          const routineTask: Omit<Task, 'id' | 'completed'> = {
            title: routineHabit.title,
            description: routineHabit.description || '',
            subtasks: [],
            dueDate: today,
            priority: 'Medium',
            recurrence: 'Daily',
            xpValue: routineHabit.xpValue,
            category: routineHabit.category,
            taskType: 'normal',
            type: 'habit',
            isRoutine: true,
            routineName: routine.name,
          };
          
          addTask(routineTask);
        }
      });
    });
  }, [routines, tasks, addTask]);

  // Get routine tasks
  const getRoutineTasks = () => {
    if (routineId) {
      const routine = routines.find(r => r.id === routineId);
      return tasks.filter(task => 
        task.isRoutine && task.routineName === routine?.name
      );
    }
    return tasks.filter(task => task.isRoutine);
  };

  const routineTasks = getRoutineTasks();
  const todayRoutineTasks = routineTasks.filter(task => 
    isSameDay(new Date(task.dueDate), new Date())
  );
  
  const completedTodayTasks = todayRoutineTasks.filter(task => task.completed);
  const completionPercentage = todayRoutineTasks.length > 0 
    ? Math.round((completedTodayTasks.length / todayRoutineTasks.length) * 100)
    : 0;

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
  };

  if (showInTodayView) {
    return (
      <div className="space-y-2">
        {todayRoutineTasks.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Routine Tasks</h3>
              <Badge variant="secondary" className="text-xs">
                {completedTodayTasks.length}/{todayRoutineTasks.length}
              </Badge>
            </div>
            
            <div className="grid gap-2">
              {todayRoutineTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/30 transition-colors">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 w-6"
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={task.completed}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        {task.routineName}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  <Badge variant="secondary" className="text-xs">
                    {task.xpValue} XP
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Routine Tasks
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {routineTasks.length} tasks
          </Badge>
        </div>
        
        {todayRoutineTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Today's Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {completedTodayTasks.length} of {todayRoutineTasks.length} routine tasks completed today
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {routineTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-2">No routine tasks yet</p>
            <p className="text-xs">Activate routines to see their tasks here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routineTasks.map((task) => {
              const isToday = isSameDay(new Date(task.dueDate), new Date());
              
              return (
                <div key={task.id} className={`border rounded-lg p-4 transition-colors ${
                  isToday ? 'border-primary/20 bg-primary/5' : ''
                }`}>
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6 mt-1"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={task.completed}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        {isToday && (
                          <Badge variant="default" className="text-xs bg-blue-500">
                            Today
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {task.routineName}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Category: {task.category}</span>
                        <span>•</span>
                        <span>XP: {task.xpValue}</span>
                        <span>•</span>
                        <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      {task.xpValue} XP
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
