
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Target, Link as LinkIcon, Trophy, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { cn } from '@/lib/utils';

interface GoalFormProps {
  onClose: () => void;
  initialGoal?: any;
}

export function GoalForm({ onClose, initialGoal }: GoalFormProps) {
  const { addGoal, updateGoal } = useGoals();
  const { tasks } = useTasks();
  
  const [title, setTitle] = useState(initialGoal?.title || '');
  const [description, setDescription] = useState(initialGoal?.description || '');
  const [category, setCategory] = useState(initialGoal?.category || 'Personal');
  const [priority, setPriority] = useState(initialGoal?.priority || 'Medium');
  const [startDate, setStartDate] = useState<Date>(
    initialGoal?.startDate ? new Date(initialGoal.startDate) : new Date()
  );
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    initialGoal?.targetDate ? new Date(initialGoal.targetDate) : undefined
  );
  
  // Numeric target fields
  const [hasNumericTarget, setHasNumericTarget] = useState(initialGoal?.hasNumericTarget || false);
  const [numericTarget, setNumericTarget] = useState(initialGoal?.numericTarget || 100);
  const [targetUnit, setTargetUnit] = useState(initialGoal?.targetUnit || 'completions');
  const [linkedHabitId, setLinkedHabitId] = useState(initialGoal?.linkedHabitId || '');
  
  // Task/habit linking
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>(initialGoal?.linkedTaskIds || []);
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>(initialGoal?.linkedHabitIds || []);

  const availableHabits = tasks.filter(task => task.type === 'habit')
    .reduce((acc, task) => {
      const existing = acc.find(h => h.title === task.title && h.category === task.category);
      if (!existing) {
        acc.push(task);
      }
      return acc;
    }, [] as any[]);

  const availableTasks = tasks.filter(task => task.type === 'task' && !task.completed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const goalData = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      startDate,
      targetDate,
      hasNumericTarget,
      numericTarget: hasNumericTarget ? numericTarget : undefined,
      targetUnit: hasNumericTarget ? targetUnit : undefined,
      linkedHabitId: hasNumericTarget && linkedHabitId ? linkedHabitId : undefined,
      linkedTaskIds: linkedTaskIds.length > 0 ? linkedTaskIds : undefined,
      linkedHabitIds: linkedHabitIds.length > 0 ? linkedHabitIds : undefined,
      currentProgress: 0,
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
    <div className="space-y-6 p-4 max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Goal Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your goal"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your goal in detail"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Career">Career</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Relationships">Relationships</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                  {targetDate ? format(targetDate, "PPP") : <span>Pick target date</span>}
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
        </div>

        {/* Numeric Target Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numeric-target"
              checked={hasNumericTarget}
              onCheckedChange={setHasNumericTarget}
            />
            <label htmlFor="numeric-target" className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Set Numeric Target
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
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <Input
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="completions, sessions, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Link to Habit (Optional)</label>
                <Select value={linkedHabitId} onValueChange={setLinkedHabitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a habit to track automatically" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No habit link</SelectItem>
                    {availableHabits.map((habit) => (
                      <SelectItem key={habit.id} value={habit.id || 'none'}>
                        <div className="flex items-center justify-between w-full">
                          <span>{habit.title}</span>
                          <Badge variant="outline" className="text-xs ml-2">
                            {habit.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {linkedHabitId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Progress will automatically update when this habit is completed
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Task/Habit Linking Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Link Tasks & Habits
          </h3>

          {availableTasks.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Link Tasks</label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={linkedTaskIds.includes(task.id)}
                      onCheckedChange={() => toggleTaskLink(task.id)}
                    />
                    <label htmlFor={`task-${task.id}`} className="text-sm flex-1 cursor-pointer">
                      {task.title}
                    </label>
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableHabits.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Link Habits</label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableHabits.map((habit) => (
                  <div key={habit.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`habit-${habit.id}`}
                      checked={linkedHabitIds.includes(habit.id)}
                      onCheckedChange={() => toggleHabitLink(habit.id)}
                    />
                    <label htmlFor={`habit-${habit.id}`} className="text-sm flex-1 cursor-pointer">
                      {habit.title}
                    </label>
                    <Badge variant="outline" className="text-xs">
                      {habit.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
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
    </div>
  );
}
