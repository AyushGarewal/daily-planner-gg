
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { Goal } from '../types/goals';

interface GoalFormProps {
  onClose: () => void;
  initialGoal?: Goal;
}

interface GoalFormData {
  title: string;
  description: string;
  category: 'Career' | 'Personal' | 'Health' | 'Education' | 'Other';
  startDate: string;
  targetDate?: string;
  hasNumericTarget: boolean;
  numericTarget?: number;
  targetUnit?: string;
  linkedTaskIds: string[];
  linkedHabitIds: string[];
}

export function GoalForm({ onClose, initialGoal }: GoalFormProps) {
  const { addGoal, updateGoal } = useGoals();
  const { tasks } = useTasks();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GoalFormData>({
    defaultValues: initialGoal ? {
      title: initialGoal.title,
      description: initialGoal.description,
      category: initialGoal.category,
      startDate: new Date(initialGoal.startDate).toISOString().split('T')[0],
      targetDate: initialGoal.targetDate ? new Date(initialGoal.targetDate).toISOString().split('T')[0] : undefined,
      hasNumericTarget: initialGoal.hasNumericTarget || false,
      numericTarget: initialGoal.numericTarget,
      targetUnit: initialGoal.targetUnit || 'times',
      linkedTaskIds: initialGoal.linkedTaskIds || [],
      linkedHabitIds: initialGoal.linkedHabitIds || []
    } : {
      startDate: new Date().toISOString().split('T')[0],
      hasNumericTarget: false,
      targetUnit: 'times',
      linkedTaskIds: [],
      linkedHabitIds: []
    }
  });

  const [selectedTasks, setSelectedTasks] = React.useState<string[]>(initialGoal?.linkedTaskIds || []);
  const [selectedHabits, setSelectedHabits] = React.useState<string[]>(initialGoal?.linkedHabitIds || []);

  const watchHasNumericTarget = watch('hasNumericTarget');
  const watchCategory = watch('category');

  // Get available tasks and habits with deduplication
  const getUniqueItems = (items: any[], type: 'task' | 'habit') => {
    const seen = new Set();
    return items.filter(item => {
      if (item.type !== type) return false;
      const key = `${item.title}-${item.category}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const availableTasks = getUniqueItems(tasks, 'task');
  const availableHabits = getUniqueItems(tasks, 'habit');

  const onSubmit = (data: GoalFormData) => {
    try {
      const goalData = {
        title: data.title,
        description: data.description,
        category: data.category,
        startDate: new Date(data.startDate),
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        hasNumericTarget: data.hasNumericTarget,
        numericTarget: data.hasNumericTarget ? data.numericTarget : undefined,
        targetUnit: data.hasNumericTarget ? data.targetUnit : undefined,
        linkedTaskIds: selectedTasks,
        linkedHabitIds: selectedHabits,
        currentProgress: initialGoal?.currentProgress || 0
      };

      console.log('Submitting goal data:', goalData);

      if (initialGoal) {
        updateGoal(initialGoal.id, goalData);
      } else {
        addGoal(goalData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting goal:', error);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
        <div className="space-y-2">
          <Label htmlFor="title">Goal Title</Label>
          <Input
            id="title"
            placeholder="e.g., Become a photographer"
            {...register('title', { required: 'Goal title is required' })}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description or Vision</Label>
          <Textarea
            id="description"
            placeholder="Describe your vision and what achieving this goal means to you..."
            rows={3}
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={watchCategory} onValueChange={(value) => setValue('category', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Career">Career</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Numeric Target Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center space-x-2">
            <Switch
              id="hasNumericTarget"
              checked={watchHasNumericTarget}
              onCheckedChange={(checked) => setValue('hasNumericTarget', checked)}
            />
            <Label htmlFor="hasNumericTarget" className="font-medium">
              Set Numeric Target
            </Label>
          </div>
          
          {watchHasNumericTarget && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numericTarget">Target Number</Label>
                <Input
                  id="numericTarget"
                  type="number"
                  min="1"
                  placeholder="100"
                  {...register('numericTarget', { 
                    required: watchHasNumericTarget ? 'Target number is required' : false,
                    min: { value: 1, message: 'Target must be at least 1' }
                  })}
                />
                {errors.numericTarget && (
                  <p className="text-sm text-destructive">{errors.numericTarget.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetUnit">Unit</Label>
                <Select onValueChange={(value) => setValue('targetUnit', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="times" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="times">times</SelectItem>
                    <SelectItem value="hours">hours</SelectItem>
                    <SelectItem value="days">days</SelectItem>
                    <SelectItem value="pages">pages</SelectItem>
                    <SelectItem value="sessions">sessions</SelectItem>
                    <SelectItem value="workouts">workouts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Task and Habit Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Link Tasks (Optional)</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
              {availableTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No unique tasks available to link</p>
              ) : (
                availableTasks.map(task => (
                  <div key={task.id} className="flex items-center space-x-2 p-1 hover:bg-muted/30 rounded">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{task.title}</span>
                      <span className="text-xs text-muted-foreground">{task.category}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedTasks.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTasks.map(taskId => {
                  const task = availableTasks.find(t => t.id === taskId);
                  return task ? (
                    <Badge key={taskId} variant="secondary" className="text-xs">
                      {task.title}
                      <button
                        type="button"
                        onClick={() => toggleTaskSelection(taskId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Link Habits (Optional)</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
              {availableHabits.length === 0 ? (
                <p className="text-sm text-muted-foreground">No unique habits available to link</p>
              ) : (
                availableHabits.map(habit => (
                  <div key={habit.id} className="flex items-center space-x-2 p-1 hover:bg-muted/30 rounded">
                    <input
                      type="checkbox"
                      checked={selectedHabits.includes(habit.id)}
                      onChange={() => toggleHabitSelection(habit.id)}
                      className="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{habit.title}</span>
                      <span className="text-xs text-muted-foreground">{habit.category} • {habit.recurrence}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedHabits.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedHabits.map(habitId => {
                  const habit = availableHabits.find(h => h.id === habitId);
                  return habit ? (
                    <Badge key={habitId} variant="secondary" className="text-xs">
                      {habit.title}
                      <button
                        type="button"
                        onClick={() => toggleHabitSelection(habitId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate', { required: 'Start date is required' })}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date (Optional)</Label>
            <Input
              id="targetDate"
              type="date"
              {...register('targetDate')}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {initialGoal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
