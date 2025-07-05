
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Target, Link as LinkIcon, Trophy, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { cn } from '@/lib/utils';
import { GoalMilestone } from '../types/goals';

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
  const [startDate, setStartDate] = useState<Date>(
    initialGoal?.startDate ? new Date(initialGoal.startDate) : new Date()
  );
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    initialGoal?.targetDate ? new Date(initialGoal.targetDate) : undefined
  );
  
  // Task/habit linking
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>(initialGoal?.linkedTaskIds || []);
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>(initialGoal?.linkedHabitIds || []);
  
  // Milestones
  const [milestones, setMilestones] = useState<GoalMilestone[]>(initialGoal?.milestones || []);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestonePercentage, setNewMilestonePercentage] = useState(25);
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState<Date | undefined>();

  const availableHabits = tasks.filter(task => task.type === 'habit')
    .reduce((acc, task) => {
      const existing = acc.find(h => h.title === task.title && h.category === task.category);
      if (!existing) {
        acc.push(task);
      }
      return acc;
    }, [] as any[]);

  const availableTasks = tasks.filter(task => task.type === 'task' && !task.completed);

  const addMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    
    const newMilestone: GoalMilestone = {
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newMilestoneTitle.trim(),
      percentageTarget: newMilestonePercentage,
      dueDate: newMilestoneDueDate,
      isCompleted: false,
      createdAt: new Date()
    };
    
    setMilestones(prev => [...prev, newMilestone].sort((a, b) => a.percentageTarget - b.percentageTarget));
    setNewMilestoneTitle('');
    setNewMilestonePercentage(25);
    setNewMilestoneDueDate(undefined);
  };

  const removeMilestone = (milestoneId: string) => {
    setMilestones(prev => prev.filter(m => m.id !== milestoneId));
  };

  const updateMilestone = (milestoneId: string, updates: Partial<GoalMilestone>) => {
    setMilestones(prev => prev.map(m => 
      m.id === milestoneId ? { ...m, ...updates } : m
    ).sort((a, b) => a.percentageTarget - b.percentageTarget));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const goalData = {
      title: title.trim(),
      description: description.trim(),
      category,
      startDate,
      targetDate,
      linkedTaskIds: linkedTaskIds.length > 0 ? linkedTaskIds : undefined,
      linkedHabitIds: linkedHabitIds.length > 0 ? linkedHabitIds : undefined,
      milestones: milestones,
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
                <SelectItem value="Other">Other</SelectItem>
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

        {/* Milestones Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Milestones
          </h3>
          
          {milestones.length > 0 && (
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-2 p-2 border rounded">
                  <Input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                    className="flex-1"
                    placeholder="Milestone title"
                  />
                  <Input
                    type="number"
                    value={milestone.percentageTarget}
                    onChange={(e) => updateMilestone(milestone.id, { percentageTarget: parseInt(e.target.value) || 0 })}
                    className="w-20"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={milestone.dueDate}
                        onSelect={(date) => updateMilestone(milestone.id, { dueDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMilestone(milestone.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Add milestone..."
                className="flex-1"
              />
              <Input
                type="number"
                value={newMilestonePercentage}
                onChange={(e) => setNewMilestonePercentage(parseInt(e.target.value) || 0)}
                className="w-20"
                min="0"
                max="100"
              />
              <span className="text-sm text-muted-foreground self-center">%</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newMilestoneDueDate}
                    onSelect={setNewMilestoneDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={addMilestone} disabled={!newMilestoneTitle.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
                    {habit.numericTarget && (
                      <Badge variant="secondary" className="text-xs">
                        Target: {habit.numericTarget}
                      </Badge>
                    )}
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
