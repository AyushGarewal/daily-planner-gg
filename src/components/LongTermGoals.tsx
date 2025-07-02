
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, Calendar, TrendingUp, Trophy, Link, CheckCircle2, Circle } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { GoalForm } from './GoalForm';
import { GoalDetail } from './GoalDetail';
import { TaskForm } from './TaskForm';
import { Goal } from '../types/goals';
import { Task } from '../types/task';
import { format } from 'date-fns';

export function LongTermGoals() {
  const { goals, getGoalProgress } = useGoals();
  const { tasks, addTask, completeTask } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedGoalForTask, setSelectedGoalForTask] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Career': return 'bg-blue-500';
      case 'Personal': return 'bg-green-500';
      case 'Health': return 'bg-red-500';
      case 'Education': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateNumericProgress = (goal: Goal) => {
    if (!goal.hasNumericTarget || !goal.numericTarget) return null;
    
    // Use current progress from goal if available, otherwise calculate from linked items
    let currentProgress = goal.currentProgress || 0;
    
    // If no current progress set, calculate from linked tasks/habits completion
    if (currentProgress === 0) {
      let completedCount = 0;
      
      // Count completed linked tasks
      if (goal.linkedTaskIds && goal.linkedTaskIds.length > 0) {
        const linkedTasks = tasks.filter(task => 
          goal.linkedTaskIds!.includes(task.id) && task.completed
        );
        completedCount += linkedTasks.length;
      }
      
      // Count completed linked habits (for habits, might count daily completions)
      if (goal.linkedHabitIds && goal.linkedHabitIds.length > 0) {
        const linkedHabits = tasks.filter(task => 
          goal.linkedHabitIds!.includes(task.id) && task.completed
        );
        completedCount += linkedHabits.length;
      }
      
      currentProgress = Math.min(completedCount, goal.numericTarget);
    }
    
    const percentage = goal.numericTarget > 0 ? Math.round((currentProgress / goal.numericTarget) * 100) : 0;
    
    return { 
      current: currentProgress, 
      target: goal.numericTarget, 
      percentage: Math.min(percentage, 100) 
    };
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const handleAddTaskToGoal = (goalId: string) => {
    setSelectedGoalForTask(goalId);
    setIsTaskFormOpen(true);
  };

  const handleTaskSubmit = (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (selectedGoalForTask) {
      const taskWithGoal = {
        ...taskData,
        goalId: selectedGoalForTask
      };
      addTask(taskWithGoal);
    }
    setIsTaskFormOpen(false);
    setSelectedGoalForTask(null);
  };

  const getLinkedTasksForGoal = (goalId: string) => {
    return tasks.filter(task => 
      (task.goalId === goalId) || 
      (goal.linkedTaskIds && goal.linkedTaskIds.includes(task.id))
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Long-Term Goals</h2>
          <p className="text-muted-foreground">Track your journey toward your biggest aspirations</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <GoalForm onClose={handleFormClose} />
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your journey by creating your first long-term goal
            </p>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal.id);
            const numericProgress = calculateNumericProgress(goal);
            const linkedTasks = getLinkedTasksForGoal(goal.id);
            
            return (
              <Card 
                key={goal.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(goal.category)}`} />
                      <Badge variant="secondary" className="text-xs">
                        {goal.category}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {goal.hasNumericTarget && (
                        <Badge variant="outline" className="text-xs bg-purple-50">
                          <Trophy className="h-3 w-3 mr-1" />
                          Target
                        </Badge>
                      )}
                      {((goal.linkedTaskIds?.length || 0) + (goal.linkedHabitIds?.length || 0)) > 0 && (
                        <Badge variant="outline" className="text-xs bg-blue-50">
                          <Link className="h-3 w-3 mr-1" />
                          Linked
                        </Badge>
                      )}
                      {goal.isCompleted && (
                        <Badge variant="default" className="bg-green-500">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight" onClick={() => handleGoalClick(goal)}>
                    {goal.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2" onClick={() => handleGoalClick(goal)}>
                    {goal.description}
                  </p>
                  
                  {/* Numeric Progress */}
                  {numericProgress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Numeric Target</span>
                        <span className="text-muted-foreground">
                          {numericProgress.current} / {numericProgress.target} {goal.targetUnit}
                        </span>
                      </div>
                      <Progress value={numericProgress.percentage} className="h-3" />
                      <div className="text-xs text-center text-muted-foreground">
                        {numericProgress.percentage}% complete
                      </div>
                    </div>
                  )}
                  
                  {/* Milestone Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Milestone Progress</span>
                      <span>{progress.percentage}%</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {progress.completedSubtasks} of {progress.totalSubtasks} tasks completed
                    </div>
                  </div>

                  {/* Linked Tasks Section */}
                  {linkedTasks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Linked Tasks</span>
                        <span>{linkedTasks.filter(t => t.completed).length}/{linkedTasks.length}</span>
                      </div>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {linkedTasks.slice(0, 3).map(task => (
                          <div key={task.id} className="flex items-center gap-2 text-xs">
                            {task.completed ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Circle className="h-3 w-3 text-gray-400" />
                            )}
                            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                        {linkedTasks.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{linkedTasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add Task Button */}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTaskToGoal(goal.id);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                    Add Task
                  </Button>
                  
                  {/* Linked Items Summary */}
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Started {format(new Date(goal.startDate), 'MMM dd')}
                      </div>
                      {goal.targetDate && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Due {format(new Date(goal.targetDate), 'MMM dd')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Task Form Dialog */}
      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>Add Task to Goal</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleTaskSubmit}
            onCancel={() => {
              setIsTaskFormOpen(false);
              setSelectedGoalForTask(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {selectedGoal && (
        <GoalDetail 
          goal={selectedGoal} 
          onClose={() => setSelectedGoal(null)} 
        />
      )}
    </div>
  );
}
