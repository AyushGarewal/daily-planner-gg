
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Target, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { Goal } from '../types/goals';
import { cn } from '@/lib/utils';

interface GoalFormProps {
  onClose: () => void;
  initialGoal?: Goal;
}

export function GoalForm({ onClose, initialGoal }: GoalFormProps) {
  const { addGoal, updateGoal } = useGoals();
  const { tasks } = useTasks();
  
  const [title, setTitle] = useState(initialGoal?.title || '');
  const [description, setDescription] = useState(initialGoal?.description || '');
  const [category, setCategory] = useState<'Career' | 'Personal' | 'Health' | 'Education' | 'Other'>(
    initialGoal?.category || 'Personal'
  );
  const [startDate, setStartDate] = useState<Date>(
    initialGoal?.startDate ? new Date(initialGoal.startDate) : new Date()
  );
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    initialGoal?.targetDate ? new Date(initialGoal.targetDate) : undefined
  );
  
  // Numerical target fields
  const [hasNumericTarget, setHasNumericTarget] = useState(initialGoal?.hasNumericTarget || false);
  const [numericTarget, setNumericTarget] = useState(initialGoal?.numericTarget || 10);
  const [targetUnit, setTargetUnit] = useState(initialGoal?.targetUnit || 'times');
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>(initialGoal?.linkedTaskIds || []);
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>(initialGoal?.linkedHabitIds || []);

  const availableTasks = tasks.filter(task => task.type === 'task');
  const availableHabits = tasks.filter(task => task.type === 'habit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const goalData = {
      title: title.trim(),
      description: description.trim(),
      category,
      startDate,
      targetDate,
      hasNumericTarget,
      numericTarget: hasNumericTarget ? numericTarget : undefined,
      targetUnit: hasNumericTarget ? targetUnit : undefined,
      linkedTaskIds: linkedTaskIds.length > 0 ? linkedTaskIds : undefined,
      linkedHabitIds: linkedHabitIds.length > 0 ? linkedHabitIds : undefined,
      currentProgress: initialGoal?.currentProgress || 0,
    };

    if (initialGoal) {
      updateGoal(initialGoal.id, goalData);
    } else {
      addGoal(goalData);
    }
    
    onClose();
  };

  const toggleTaskLink = (taskId: string) => {
    setLinkedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleHabitLink = (habitId: string) => {
    setLinkedHabitIds(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Goal Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your long-term goal"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your goal and why it matters to you"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue />
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

          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Date (Optional)</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !targetDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {targetDate ? format(targetDate, "PPP") : <span>Pick a target date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={targetDate}
                onSelect={setTargetDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Numerical Target Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numeric-target"
              checked={hasNumericTarget}
              onCheckedChange={setHasNumericTarget}
            />
            <label htmlFor="numeric-target" className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Set Numerical Target
            </label>
          </div>

          {hasNumericTarget && (
            <div className="space-y-4 ml-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Number</label>
                  <Input
                    type="number"
                    value={numericTarget}
                    onChange={(e) => setNumericTarget(parseInt(e.target.value) || 0)}
                    min="1"
                    placeholder="e.g., 50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <Select value={targetUnit} onValueChange={setTargetUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="times">times</SelectItem>
                      <SelectItem value="hours">hours</SelectItem>
                      <SelectItem value="days">days</SelectItem>
                      <SelectItem value="pages">pages</SelectItem>
                      <SelectItem value="sessions">sessions</SelectItem>
                      <SelectItem value="pounds">pounds</SelectItem>
                      <SelectItem value="kilograms">kilograms</SelectItem>
                      <SelectItem value="miles">miles</SelectItem>
                      <SelectItem value="kilometers">kilometers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                Target: Complete this goal {numericTarget} {targetUnit}
              </div>
            </div>
          )}
        </div>

        {/* Habit and Task Linking Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Link Tasks & Habits (Optional)
          </h3>
          <p className="text-xs text-muted-foreground">
            Link habits or tasks to this goal. When linked items are completed, your goal progress will automatically update.
          </p>

          {availableHabits.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Link Habits</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableHabits.map((habit) => (
                  <div key={habit.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`habit-${habit.id}`}
                      checked={linkedHabitIds.includes(habit.id)}
                      onCheckedChange={() => toggleHabitLink(habit.id)}
                    />
                    <label htmlFor={`habit-${habit.id}`} className="text-sm flex-1 flex items-center justify-between">
                      <span>{habit.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {habit.category}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableTasks.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Link Tasks</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={linkedTaskIds.includes(task.id)}
                      onCheckedChange={() => toggleTaskLink(task.id)}
                    />
                    <label htmlFor={`task-${task.id}`} className="text-sm flex-1 flex items-center justify-between">
                      <span>{task.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(linkedHabitIds.length > 0 || linkedTaskIds.length > 0) && (
            <div className="text-xs text-muted-foreground p-2 bg-green-50 rounded border-l-2 border-green-200">
              ✓ {linkedHabitIds.length + linkedTaskIds.length} items linked. Progress will auto-update when these are completed.
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {initialGoal ? 'Update Goal' : 'Create Goal'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
