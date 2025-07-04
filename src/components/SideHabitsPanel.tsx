
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, TrendingUp, Calendar } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

export function SideHabitsPanel() {
  const { tasks, addTask } = useTasks();
  const [newHabit, setNewHabit] = useState({
    title: '',
    category: 'Health',
    numericTarget: 1,
    unit: 'times'
  });

  const handleAddHabit = () => {
    if (newHabit.title.trim()) {
      addTask({
        title: newHabit.title,
        description: '',
        subtasks: [],
        dueDate: new Date(),
        priority: 'Medium',
        recurrence: 'Daily',
        xpValue: 15,
        category: newHabit.category,
        taskType: 'normal',
        type: 'habit',
        numericTarget: newHabit.numericTarget,
        unit: newHabit.unit
      });
      setNewHabit({
        title: '',
        category: 'Health',
        numericTarget: 1,
        unit: 'times'
      });
    }
  };

  const getCompletionPercentage = (habitTitle: string, target: number) => {
    const completedInstances = tasks.filter(task => 
      task.title === habitTitle && 
      task.type === 'habit' && 
      task.completed
    );
    
    // Safety check to prevent undefined length error
    if (!completedInstances || !Array.isArray(completedInstances)) {
      return 0;
    }
    
    const completedCount = completedInstances.length;
    return Math.min((completedCount / target) * 100, 100);
  };

  const uniqueHabits = tasks
    .filter(task => task.type === 'habit')
    .reduce((acc, task) => {
      const existing = acc.find(h => h.title === task.title && h.category === task.category);
      if (!existing) {
        acc.push(task);
      }
      return acc;
    }, [] as any[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Side Habits</h2>
          <p className="text-muted-foreground">Track your daily habits and build consistency</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Habit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Habit name (e.g., Drink water, Exercise)"
            value={newHabit.title}
            onChange={(e) => setNewHabit(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select 
              value={newHabit.category} 
              onValueChange={(value) => setNewHabit(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Learning">Learning</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              min="1"
              placeholder="Target (e.g., 8)"
              value={newHabit.numericTarget}
              onChange={(e) => setNewHabit(prev => ({ ...prev, numericTarget: parseInt(e.target.value) || 1 }))}
            />

            <Input
              placeholder="Unit (e.g., glasses, minutes)"
              value={newHabit.unit}
              onChange={(e) => setNewHabit(prev => ({ ...prev, unit: e.target.value }))}
            />
          </div>

          <Button onClick={handleAddHabit} disabled={!newHabit.title.trim()}>
            Add Habit
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {uniqueHabits.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
              <p className="text-muted-foreground">Create your first habit to start building consistency</p>
            </CardContent>
          </Card>
        ) : (
          uniqueHabits.map((habit, index) => {
            const target = habit.numericTarget || 1;
            const completionPercentage = getCompletionPercentage(habit.title, target);
            const completedCount = tasks.filter(task => 
              task.title === habit.title && 
              task.type === 'habit' && 
              task.completed
            ).length;

            return (
              <Card key={`${habit.title}-${habit.category}-${index}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{habit.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{habit.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {completedCount}/{target} {habit.unit || 'completions'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{Math.round(completionPercentage)}%</div>
                      <div className="text-sm text-muted-foreground">Complete</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={completionPercentage} className="h-3" />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
