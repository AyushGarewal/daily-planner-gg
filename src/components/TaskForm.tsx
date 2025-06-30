
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { Task, CATEGORIES, Subtask } from '../types/task';
import { TaskTypeSelector } from './TaskTypeSelector';
import { WeekdaySelector } from './WeekdaySelector';
import { useCustomCategories } from '../hooks/useCustomCategories';
import { useGoals } from '../hooks/useGoals';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'completed'>) => void;
  onCancel: () => void;
  initialTask?: Task;
  preSelectedProjectId?: string;
  preSelectedGoalId?: string;
}

export function TaskForm({ onSubmit, onCancel, initialTask, preSelectedProjectId, preSelectedGoalId }: TaskFormProps) {
  const { getCategoriesByType, addCategory } = useCustomCategories();
  const { goals } = useGoals();
  
  const [taskType, setTaskType] = useState<'task' | 'habit'>(initialTask?.type || 'task');
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialTask?.subtasks || []);
  const [dueDate, setDueDate] = useState<Date>(initialTask?.dueDate || new Date());
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>(initialTask?.priority || 'Medium');
  const [recurrence, setRecurrence] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly'>(initialTask?.recurrence || 'None');
  const [xpValue, setXpValue] = useState(initialTask?.xpValue || 10);
  const [category, setCategory] = useState(initialTask?.category || 'Personal');
  const [customCategory, setCustomCategory] = useState(initialTask?.customCategory || '');
  const [taskTypeField, setTaskTypeField] = useState<'normal' | 'surplus'>(initialTask?.taskType || 'normal');
  const [weekDays, setWeekDays] = useState<number[]>(initialTask?.weekDays || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [showTypeSelector, setShowTypeSelector] = useState(!initialTask);
  const [projectId, setProjectId] = useState(initialTask?.projectId || preSelectedProjectId || '');
  const [goalId, setGoalId] = useState(initialTask?.goalId || preSelectedGoalId || '');
  const [useCustomCat, setUseCustomCat] = useState(!!initialTask?.customCategory);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Get projects from localStorage
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  
  // Get custom categories for this task type
  const customCategories = getCategoriesByType(taskType);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks(prev => [...prev, { 
        id: crypto.randomUUID(), 
        title: newSubtask.trim(), 
        completed: false 
      }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const handleAddCustomCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName.trim(), taskType);
      setCustomCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // If it's a habit with weekly recurrence, ensure weekdays are selected
    if (taskType === 'habit' && recurrence === 'Weekly' && weekDays.length === 0) {
      alert('Please select at least one day for weekly habits');
      return;
    }

    // Set appropriate due date for habits created today
    const submissionDate = new Date(dueDate);
    if (taskType === 'habit' && recurrence === 'Daily') {
      // For daily habits, start today
      submissionDate.setHours(new Date().getHours(), new Date().getMinutes());
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      subtasks,
      dueDate: submissionDate,
      priority,
      recurrence: taskType === 'habit' ? recurrence : 'None',
      xpValue,
      category: useCustomCat ? 'Custom' : category,
      customCategory: useCustomCat ? customCategory : undefined,
      taskType: taskTypeField,
      type: taskType,
      weekDays: taskType === 'habit' && recurrence === 'Weekly' ? weekDays : undefined,
      projectId: projectId || undefined,
      goalId: goalId || undefined,
    });
  };

  if (showTypeSelector && !initialTask) {
    return (
      <div className="space-y-4 p-4">
        <TaskTypeSelector 
          selectedType={taskType}
          onTypeSelect={(type) => {
            setTaskType(type);
            setShowTypeSelector(false);
            // Set default recurrence for habits
            if (type === 'habit') {
              setRecurrence('Daily');
            }
          }}
        />
        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {!initialTask && (
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setShowTypeSelector(true)}
          >
            ← Change Type
          </Button>
          <div className="text-sm text-muted-foreground">
            Creating a {taskType}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Enter ${taskType} title`}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`Enter ${taskType} description`}
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Subtasks</label>
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2">
              <Input value={subtask.title} readOnly className="flex-1" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeSubtask(subtask.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add subtask"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
            />
            <Button type="button" variant="outline" onClick={addSubtask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Project and Goal Linking */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Link to Project</label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select project (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No project</SelectItem>
              {projects.map((project: any) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Link to Goal</label>
          <Select value={goalId} onValueChange={setGoalId}>
            <SelectTrigger>
              <SelectValue placeholder="Select goal (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No goal</SelectItem>
              {goals.map((goal) => (
                <SelectItem key={goal.id} value={goal.id}>
                  {goal.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => date && setDueDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <Select value={priority} onValueChange={(value: 'High' | 'Medium' | 'Low') => setPriority(value)}>
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

      {taskType === 'habit' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Recurrence</label>
            <Select value={recurrence} onValueChange={(value: 'None' | 'Daily' | 'Weekly' | 'Monthly') => setRecurrence(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">XP Value</label>
            <Input
              type="number"
              value={xpValue}
              onChange={(e) => setXpValue(parseInt(e.target.value) || 0)}
              min="1"
              max="100"
            />
          </div>
        </div>
      )}

      {taskType === 'habit' && recurrence === 'Weekly' && (
        <WeekdaySelector
          selectedDays={weekDays}
          onChange={setWeekDays}
        />
      )}

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="standard-cat"
              checked={!useCustomCat}
              onChange={() => setUseCustomCat(false)}
            />
            <label htmlFor="standard-cat" className="text-sm">Standard Category</label>
          </div>
          
          {!useCustomCat && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="custom-cat"
              checked={useCustomCat}
              onChange={() => setUseCustomCat(true)}
            />
            <label htmlFor="custom-cat" className="text-sm">Custom Category</label>
          </div>

          {useCustomCat && (
            <div className="space-y-2">
              <Select value={customCategory} onValueChange={setCustomCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select custom category" />
                </SelectTrigger>
                <SelectContent>
                  {customCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Create new category"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomCategory())}
                />
                <Button type="button" onClick={handleAddCustomCategory} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {taskType === 'task' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">XP Value</label>
            <Input
              type="number"
              value={xpValue}
              onChange={(e) => setXpValue(parseInt(e.target.value) || 0)}
              min="1"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Task Type</label>
            <Select value={taskTypeField} onValueChange={(value: 'normal' | 'surplus') => setTaskTypeField(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="surplus">Surplus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {initialTask ? `Update ${taskType}` : `Create ${taskType}`}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
