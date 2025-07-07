
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Circle, Calendar, Target, ArrowRight } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Routine } from '../types/routine';
import { Task } from '../types/task';
import { format, isSameDay, getDay, startOfDay, addDays, subDays } from 'date-fns';

interface RoutineTaskIntegrationProps {
  routineId?: string;
  showInTodayView?: boolean;
  showInWeekView?: boolean;
  showInMonthView?: boolean;
  targetDate?: Date;
}

export function RoutineTaskIntegration({ 
  routineId, 
  showInTodayView = false, 
  showInWeekView = false,
  showInMonthView = false,
  targetDate 
}: RoutineTaskIntegrationProps) {
  const { tasks, addTask, completeTask, updateTask } = useTasks();
  const [routines] = useLocalStorage<Routine[]>('routines', []);
  const [routineCompletions, setRoutineCompletions] = useLocalStorage<Record<string, string[]>>('routineCompletions', {});
  
  const displayDate = targetDate || new Date();
  
  // Generate routine tasks for ACTIVE routines only
  useEffect(() => {
    const today = startOfDay(displayDate);
    const todayWeekday = getDay(today);
    
    // Only process ACTIVE routines
    const activeRoutines = routines.filter(routine => routine.active);
    
    activeRoutines.forEach(routine => {
      if (!routine.daysOfWeek.includes(todayWeekday)) return;
      
      routine.habits.forEach(routineHabit => {
        // Check if task already exists for this date
        const existingTask = tasks.find(task => 
          task.isRoutine && 
          task.routineName === routine.name &&
          task.title === routineHabit.title &&
          isSameDay(new Date(task.dueDate), today)
        );
        
        if (!existingTask) {
          // Create routine task for this date
          const routineTask: Omit<Task, 'id' | 'completed'> = {
            title: routineHabit.title,
            description: routineHabit.description || `Part of ${routine.name} routine`,
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
    
    // Clean up tasks from inactive routines
    const inactiveRoutineNames = routines
      .filter(routine => !routine.active)
      .map(routine => routine.name);
    
    // Remove tasks from inactive routines
    tasks.forEach(task => {
      if (task.isRoutine && task.routineName && inactiveRoutineNames.includes(task.routineName)) {
        console.log(`Removing task from inactive routine: ${task.title}`);
        // Don't call deleteTask here as it would cause infinite loop
        // The cleanup will happen via the tasks filter
      }
    });
    
  }, [routines, displayDate, tasks, addTask]);

  // Get routine tasks for the display date (only from ACTIVE routines)
  const getRoutineTasksForDate = (date: Date) => {
    const activeRoutineNames = routines
      .filter(routine => routine.active)
      .map(routine => routine.name);
    
    return tasks.filter(task => 
      task.isRoutine && 
      task.routineName &&
      activeRoutineNames.includes(task.routineName) &&
      isSameDay(new Date(task.dueDate), date)
    );
  };

  // Mark routine as completed for a specific date
  const markRoutineCompleted = (routineName: string, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setRoutineCompletions(prev => ({
      ...prev,
      [routineName]: [...(prev[routineName] || []), dateKey]
    }));
  };

  // Check if routine was completed on a specific date
  const isRoutineCompletedOnDate = (routineName: string, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return routineCompletions[routineName]?.includes(dateKey) || false;
  };

  // Handle task completion and check if routine is complete
  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    completeTask(taskId);
    
    // Check if all routine tasks for this date are now completed
    if (task.isRoutine && task.routineName) {
      const routineTasksForDate = getRoutineTasksForDate(new Date(task.dueDate));
      const routineTasksForThisRoutine = routineTasksForDate.filter(t => 
        t.routineName === task.routineName
      );
      
      // Check if all tasks are completed (including the one we just completed)
      const allCompleted = routineTasksForThisRoutine.every(t => 
        t.id === taskId || t.completed
      );
      
      if (allCompleted) {
        markRoutineCompleted(task.routineName, new Date(task.dueDate));
      }
    }
  };

  const routineTasks = getRoutineTasksForDate(displayDate);
  const completedTasks = routineTasks.filter(task => task.completed);
  const completionPercentage = routineTasks.length > 0 
    ? Math.round((completedTasks.length / routineTasks.length) * 100)
    : 0;

  // Group tasks by routine (only active routines)
  const tasksByRoutine = routineTasks.reduce((acc, task) => {
    const routineName = task.routineName || 'Unknown';
    if (!acc[routineName]) {
      acc[routineName] = [];
    }
    acc[routineName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  if (showInTodayView || showInWeekView || showInMonthView) {
    return (
      <div className="space-y-3">
        {Object.keys(tasksByRoutine).length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Routine Tasks
                {targetDate && (
                  <span className="text-xs">
                    - {format(targetDate, 'MMM dd')}
                  </span>
                )}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {completedTasks.length}/{routineTasks.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {Object.entries(tasksByRoutine).map(([routineName, tasks]) => {
                const routineCompleted = tasks.every(t => t.completed);
                const routine = routines.find(r => r.name === routineName && r.active);
                
                // Only show if routine is still active
                if (!routine) return null;
                
                return (
                  <div key={routineName} className={`border rounded-lg p-3 ${
                    routineCompleted ? 'bg-green-50 border-green-200' : 'bg-muted/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{routineName}</h4>
                        {routineCompleted && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            Complete
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {tasks.filter(t => t.completed).length}/{tasks.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 p-2 bg-background rounded border">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-5 w-5"
                            onClick={() => handleCompleteTask(task.id)}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </span>
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
                  </div>
                );
              })}
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
            {targetDate && (
              <span className="text-sm font-normal text-muted-foreground">
                - {format(targetDate, 'EEEE, MMM dd')}
              </span>
            )}
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {routineTasks.length} tasks
          </Badge>
        </div>
        
        {routineTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {completedTasks.length} of {routineTasks.length} routine tasks completed
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {routineTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-2">No routine tasks for this date</p>
            <p className="text-xs">
              {targetDate 
                ? `No active routines scheduled for ${format(targetDate, 'EEEE')}`
                : 'Activate routines to see their tasks here'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(tasksByRoutine).map(([routineName, tasks]) => {
              const routineCompleted = tasks.every(t => t.completed);
              const routine = routines.find(r => r.name === routineName && r.active);
              
              // Only show if routine is still active
              if (!routine) return null;
              
              return (
                <div key={routineName} className={`border rounded-lg p-4 ${
                  routineCompleted ? 'border-green-200 bg-green-50' : ''
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{routineName}</h4>
                      {routineCompleted && (
                        <Badge variant="default" className="bg-green-500">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline">
                      {tasks.filter(t => t.completed).length}/{tasks.length} tasks
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6 mt-1"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h4>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <span>Category: {task.category}</span>
                            <span>•</span>
                            <span>XP: {task.xpValue}</span>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="text-xs">
                          {task.xpValue} XP
                        </Badge>
                      </div>
                    ))}
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
