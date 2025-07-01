
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, X, FolderOpen, Target } from 'lucide-react';
import { format } from 'date-fns';
import { Task, CATEGORIES, Subtask } from '../types/task';
import { TaskTypeSelector } from './TaskTypeSelector';
import { WeekdaySelector } from './WeekdaySelector';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'completed'>) => void;
  onCancel: () => void;
  initialTask?: Task;
  preSelectedProjectId?: string;
  preSelectedGoalId?: string;
}

export function TaskForm({ onSubmit, onCancel, initialTask, preSelectedProjectId, preSelectedGoalId }: TaskFormProps) {
  const [taskType, setTaskType] = useState<'task' | 'habit'>(initialTask?.type || 'task');
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialTask?.subtasks || []);
  const [dueDate, setDueDate] = useState<Date>(initialTask?.dueDate ? new Date(initialTask.dueDate) : new Date());
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>(initialTask?.priority || 'Medium');
  const [recurrence, setRecurrence] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly'>(initialTask?.recurrence || 'None');
  const [xpValue, setXpValue] = useState(initialTask?.xpValue || 10);
  const [category, setCategory] = useState(initialTask?.category || 'Personal');
  const [taskTypeField, setTaskTypeField] = useState<'normal' | 'surplus'>(initialTask?.taskType || 'normal');
  const [weekDays, setWeekDays] = useState<number[]>(initialTask?.weekDays || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [showTypeSelector, setShowTypeSelector] = useState(!initialTask);
  const [projectId, setProjectId] = useState(initialTask?.projectId || preSelectedProjectId || '');
  const [goalId, setGoalId] = useState(initialTask?.goalId || preSelectedGoalId || '');

  // Safe function to get projects
  const getProjects = () => {
    try {
      const stored = localStorage.getItem('projects');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  };

  // Safe function to get goals
  const getGoals = () => {
    try {
      const stored = localStorage.getItem('goals');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading goals:', error);
      return [];
    }
  };
  
  const projects = getProjects();
  const goals = getGoals();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validation for weekly habits
    if (taskType === 'habit' && recurrence === 'Weekly' && weekDays.length === 0) {
      alert('Please select at least one day for weekly habits');
      return;
    }

    // Set appropriate due date for habits created today
    const submissionDate = new Date(dueDate);
    if (taskType === 'habit' && recurrence === 'Daily') {
      submissionDate.setHours(new Date().getHours(), new Date().getMinutes());
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      subtasks,
      dueDate: submissionDate,
      priority,
      recurrence: taskType === 'habit' ? recurrence : 'None',
      xpValue,
      category,
      taskType: taskTypeField,
      type: taskType,
      weekDays: taskType === 'habit' && recurrence === 'Weekly' ? weekDays : undefined,
      projectId: projectId || undefined,
      goalId: goalId || undefined,
    };

    console.log('Submitting task data:', taskData);
    onSubmit(taskData);
  };

  // Early return for type selector
  if (showTypeSelector && !initialTask) {
    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-semibold mb-4">What would you like to create?</h3>
        <TaskTypeSelector 
          selectedType={taskType}
          onTypeSelect={(type) => {
            setTaskType(type);
            setShowTypeSelector(false);
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

  const selectedProject = projects.find((p: any) => p.id === projectId);
  const selectedGoal = goals.find((g: any) => g.id === goalId);

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {!initialTask && (
          <div className="flex items-center justify-between mb-4">
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

        {/* Subtasks Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Subtasks</label>
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

        {/* Project and Goal Linking Section */}
        <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-muted/20">
          <h3 className="text-sm font-semibold mb-2">Link to Projects & Goals</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <FolderOpen className="h-4 w-4" />
                Link to Project
              </label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: project.color || '#gray' }}></div>
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProject && (
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    <FolderOpen className="h-3 w-3 mr-1" />
                    {selectedProject.name}
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <Target className="h-4 w-4" />
                Link to Goal
              </label>
              <Select value={goalId} onValueChange={setGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No goal</SelectItem>
                  {goals.map((goal: any) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{goal.title}</span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {goal.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedGoal && (
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    {selectedGoal.title}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {(selectedProject || selectedGoal) && (
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-200">
              💡 This {taskType} will contribute to {selectedProject ? `project "${selectedProject.name}"` : ''}{selectedProject && selectedGoal ? ' and ' : ''}{selectedGoal ? `goal "${selectedGoal.title}"` : ''}
            </div>
          )}
        </div>

        {/* Date and Priority */}
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

        {/* Habit-specific fields */}
        {taskType === 'habit' && (
          <>
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

            {recurrence === 'Weekly' && (
              <WeekdaySelector
                selectedDays={weekDays}
                onChange={setWeekDays}
              />
            )}
          </>
        )}

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
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
        </div>

        {/* Task-specific fields */}
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
    </div>
  );
}
