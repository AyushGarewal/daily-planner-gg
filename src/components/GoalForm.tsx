
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useGoals } from '../hooks/useGoals';
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
}

export function GoalForm({ onClose, initialGoal }: GoalFormProps) {
  const { addGoal, updateGoal } = useGoals();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GoalFormData>({
    defaultValues: initialGoal ? {
      title: initialGoal.title,
      description: initialGoal.description,
      category: initialGoal.category,
      startDate: new Date(initialGoal.startDate).toISOString().split('T')[0],
      targetDate: initialGoal.targetDate ? new Date(initialGoal.targetDate).toISOString().split('T')[0] : undefined
    } : {
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = (data: GoalFormData) => {
    const goalData = {
      title: data.title,
      description: data.description,
      category: data.category,
      startDate: new Date(data.startDate),
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined
    };

    if (initialGoal) {
      updateGoal(initialGoal.id, goalData);
    } else {
      addGoal(goalData);
    }
    
    onClose();
  };

  const selectedCategory = watch('category');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Select value={selectedCategory} onValueChange={(value) => setValue('category', value as any)}>
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
        {errors.category && (
          <p className="text-sm text-destructive">Please select a category</p>
        )}
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
  );
}
