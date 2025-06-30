
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Calendar, TrendingUp, Trophy, Link } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { GoalForm } from './GoalForm';
import { GoalDetail } from './GoalDetail';
import { Goal } from '../types/goals';
import { format } from 'date-fns';

export function LongTermGoals() {
  const { goals, getGoalProgress } = useGoals();
  const { tasks } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

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
    
    // Calculate progress from linked tasks/habits completion
    let completedCount = 0;
    
    // Count completed linked tasks
    if (goal.linkedTaskIds) {
      const linkedTasks = tasks.filter(task => 
        goal.linkedTaskIds!.includes(task.id) && task.completed
      );
      completedCount += linkedTasks.length;
    }
    
    // Count completed linked habits (you might want to count daily completions differently)
    if (goal.linkedHabitIds) {
      const linkedHabits = tasks.filter(task => 
        goal.linkedHabitIds!.includes(task.id) && task.completed
      );
      completedCount += linkedHabits.length;
    }
    
    const progress = Math.min(completedCount, goal.numericTarget);
    const percentage = Math.round((progress / goal.numericTarget) * 100);
    
    return { current: progress, target: goal.numericTarget, percentage };
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
            <GoalForm onClose={() => setIsFormOpen(false)} />
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
            
            return (
              <Card 
                key={goal.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                onClick={() => setSelectedGoal(goal)}
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
                  <CardTitle className="text-lg leading-tight">{goal.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
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
                  
                  {/* Linked Items Summary */}
                  {((goal.linkedTaskIds?.length || 0) + (goal.linkedHabitIds?.length || 0)) > 0 && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      {goal.linkedTaskIds?.length || 0} linked tasks, {goal.linkedHabitIds?.length || 0} linked habits
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedGoal && (
        <GoalDetail 
          goal={selectedGoal} 
          onClose={() => setSelectedGoal(null)} 
        />
      )}
    </div>
  );
}
