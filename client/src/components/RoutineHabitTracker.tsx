
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock, Flame, Target } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/task';
import { format } from 'date-fns';

interface RoutineHabitTrackerProps {
  routineId?: string;
  routineName?: string;
  showInTodayView?: boolean;
  onHabitComplete?: (habitId: string) => void;
}

export function RoutineHabitTracker({ 
  routineId, 
  routineName, 
  showInTodayView = false,
  onHabitComplete 
}: RoutineHabitTrackerProps) {
  const { tasks, completeTask, progress } = useTasks();

  // Get routine habits - tasks that are habits and belong to this routine
  const routineHabits = tasks.filter(task => 
    task.type === 'habit' && 
    task.isRoutine && 
    (!routineId || task.routineName === routineName)
  );

  // Get today's routine habits
  const todayHabits = routineHabits.filter(habit => {
    const today = new Date();
    const habitDate = new Date(habit.dueDate);
    
    if (habit.recurrence === 'Daily') {
      return habitDate.toDateString() === today.toDateString();
    }
    
    if (habit.recurrence === 'Weekly' && habit.weekDays) {
      const todayWeekday = today.getDay();
      return habit.weekDays.includes(todayWeekday) && 
             habitDate.toDateString() === today.toDateString();
    }
    
    return false;
  });

  const completedTodayHabits = todayHabits.filter(habit => habit.completed);
  const completionPercentage = todayHabits.length > 0 
    ? Math.round((completedTodayHabits.length / todayHabits.length) * 100)
    : 0;

  const handleHabitComplete = (habitId: string) => {
    completeTask(habitId);
    onHabitComplete?.(habitId);
  };

  const getStreakBadge = (habit: Task) => {
    // This would typically calculate actual streak from historical data
    // For now, showing a placeholder streak calculation
    const baseStreak = Math.floor(Math.random() * 10) + 1;
    return (
      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
        <Flame className="h-3 w-3 mr-1" />
        {baseStreak} day streak
      </Badge>
    );
  };

  if (showInTodayView) {
    // Simplified view for Today tab
    return (
      <div className="space-y-2">
        {todayHabits.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Routine Habits</h3>
              <Badge variant="secondary" className="text-xs">
                {completedTodayHabits.length}/{todayHabits.length}
              </Badge>
            </div>
            
            <div className="grid gap-2">
              {todayHabits.map((habit) => (
                <div key={habit.id} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/30 transition-colors">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 w-6"
                    onClick={() => handleHabitComplete(habit.id)}
                    disabled={habit.completed}
                  >
                    {habit.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {habit.title}
                      </span>
                      {habit.routineName && (
                        <Badge variant="outline" className="text-xs">
                          {habit.routineName}
                        </Badge>
                      )}
                    </div>
                    {habit.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {habit.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {habit.xpValue} XP
                    </Badge>
                    {getStreakBadge(habit)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full view for routine management
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {routineName ? `${routineName} Habits` : 'Routine Habits'}
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {routineHabits.length} habits
          </Badge>
        </div>
        
        {todayHabits.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Today's Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {completedTodayHabits.length} of {todayHabits.length} habits completed today
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {routineHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-2">No routine habits yet</p>
            <p className="text-xs">Create habits within routines to track them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routineHabits.map((habit) => {
              const isToday = todayHabits.some(h => h.id === habit.id);
              
              return (
                <div key={habit.id} className={`border rounded-lg p-4 transition-colors ${
                  isToday ? 'border-primary/20 bg-primary/5' : ''
                }`}>
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6 mt-1"
                      onClick={() => handleHabitComplete(habit.id)}
                      disabled={habit.completed}
                    >
                      {habit.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {habit.title}
                        </h4>
                        {isToday && (
                          <Badge variant="default" className="text-xs bg-blue-500">
                            Today
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {habit.recurrence}
                        </Badge>
                      </div>
                      
                      {habit.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {habit.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Category: {habit.category}</span>
                        <span>•</span>
                        <span>XP: {habit.xpValue}</span>
                        {habit.weekDays && habit.weekDays.length > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {habit.weekDays.length === 7 ? 'Daily' : `${habit.weekDays.length} days/week`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {getStreakBadge(habit)}
                      <Badge variant="secondary" className="text-xs">
                        {habit.xpValue} XP
                      </Badge>
                    </div>
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
