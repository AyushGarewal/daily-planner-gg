
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Calendar, TrendingUp, Trophy, Link, CheckCircle } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { GoalForm } from './GoalForm';
import { GoalDetail } from './GoalDetail';
import { Goal } from '../types/goals';
import { ProjectTaskIntegration } from './ProjectTaskIntegration';
import { format } from 'date-fns';

export function LongTermGoals() {
  const { goals, getGoalProgress, updateGoal } = useGoals();
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

  const calculateLinkedHabitsProgress = (goal: Goal) => {
    if (!goal.linkedHabitIds || goal.linkedHabitIds.length === 0) return null;
    
    // Get all linked habits
    const linkedHabits = tasks.filter(task => 
      goal.linkedHabitIds!.includes(task.id) && task.type === 'habit'
    );
    
    if (linkedHabits.length === 0) return null;
    
    // Calculate total progress from all linked habits
    let totalProgress = 0;
    let totalTarget = 0;
    
    linkedHabits.forEach(habit => {
      // Safely access numericTarget with fallback
      const habitTarget = habit.numericTarget || 1;
      totalTarget += habitTarget;
      
      // Count completed instances of this habit
      const completedCount = tasks.filter(t => 
        t.title === habit.title && 
        t.type === 'habit' && 
        t.completed
      ).length;
      totalProgress += Math.min(completedCount, habitTarget);
    });
    
    if (totalTarget === 0) return null;
    
    const percentage = Math.round((totalProgress / totalTarget) * 100);
    
    return {
      current: totalProgress,
      target: totalTarget,
      percentage: Math.min(percentage, 100)
    };
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
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
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal.id);
            const linkedHabitsProgress = calculateLinkedHabitsProgress(goal);
            
            return (
              <Card key={goal.id} className="w-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(goal.category)}`} />
                      <Badge variant="secondary" className="text-xs">
                        {goal.category}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
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
                  <p className="text-sm text-muted-foreground">
                    {goal.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Tracking */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Linked Habits Progress */}
                    {linkedHabitsProgress && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Linked Habits Progress</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {linkedHabitsProgress.current} / {linkedHabitsProgress.target} completed
                          </span>
                          <span className="text-muted-foreground">
                            {linkedHabitsProgress.percentage}%
                          </span>
                        </div>
                        <Progress value={linkedHabitsProgress.percentage} className="h-3" />
                      </div>
                    )}
                    
                    {/* Milestone Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Milestone Progress</span>
                        <span className="text-muted-foreground">{progress.percentage}%</span>
                      </div>
                      <Progress value={progress.percentage} className="h-3" />
                      <div className="text-xs text-muted-foreground">
                        {progress.completedSubtasks} of {progress.totalSubtasks} tasks completed
                      </div>
                    </div>
                  </div>
                  
                  {/* Milestones */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Milestones</h4>
                      <div className="space-y-1">
                        {goal.milestones.map((milestone, index) => (
                          <div key={milestone.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle className={`h-4 w-4 ${milestone.isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />
                            <span className={milestone.isCompleted ? 'line-through text-muted-foreground' : ''}>
                              {milestone.title} ({milestone.percentageTarget}%)
                            </span>
                            {milestone.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Due {format(new Date(milestone.dueDate), 'MMM dd')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Linked Items Summary */}
                  {((goal.linkedTaskIds?.length || 0) + (goal.linkedHabitIds?.length || 0)) > 0 && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      <div className="flex items-center gap-4">
                        {(goal.linkedTaskIds?.length || 0) > 0 && (
                          <span>{goal.linkedTaskIds?.length} linked tasks</span>
                        )}
                        {(goal.linkedHabitIds?.length || 0) > 0 && (
                          <span>{goal.linkedHabitIds?.length} linked habits</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Task Integration */}
                  <div className="border-t pt-4">
                    <ProjectTaskIntegration
                      projectId={goal.id}
                      projectName={goal.title}
                      projectColor={getCategoryColor(goal.category).replace('bg-', '')}
                    />
                  </div>
                  
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
                  
                  <Button 
                    variant="outline" 
                    onClick={() => handleGoalClick(goal)}
                    className="w-full"
                  >
                    View Details
                  </Button>
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
