
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FolderOpen, Calendar as CalendarIcon, Target, FileText, CheckCircle, Pause, Play, X, Edit, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Project, ProjectNote, PROJECT_COLORS, PROJECT_ICONS } from '../types/project';
import { useTasks } from '../hooks/useTasks';
import { Task, Subtask } from '../types/task';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function ProjectManager() {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(new Date());
  const [newTaskSubtasks, setNewTaskSubtasks] = useState<Subtask[]>([]);
  const { tasks, addTask, deleteTask, completeTask, toggleSubtask } = useTasks();

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    category: 'short-term' as Project['category'],
    startDate: undefined as Date | undefined,
    targetDate: undefined as Date | undefined,
    color: PROJECT_COLORS[0],
    icon: PROJECT_ICONS[0],
    initialTasks: [] as Array<{
      title: string;
      dueDate: Date;
      subtasks: Subtask[];
    }>
  });

  const resetForm = () => {
    setProjectForm({
      name: '',
      description: '',
      category: 'short-term',
      startDate: undefined,
      targetDate: undefined,
      color: PROJECT_COLORS[0],
      icon: PROJECT_ICONS[0],
      initialTasks: []
    });
  };

  const addTaskToProject = () => {
    if (!newTaskTitle.trim()) return;

    const newTask = {
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate || new Date(),
      subtasks: newTaskSubtasks.filter(st => st.title.trim())
    };

    setProjectForm(prev => ({
      ...prev,
      initialTasks: [...prev.initialTasks, newTask]
    }));

    setNewTaskTitle('');
    setNewTaskDueDate(new Date());
    setNewTaskSubtasks([]);
  };

  const removeTaskFromProject = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      initialTasks: prev.initialTasks.filter((_, i) => i !== index)
    }));
  };

  const addSubtaskToNewTask = () => {
    const newSubtask: Subtask = {
      id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      completed: false
    };
    setNewTaskSubtasks(prev => [...prev, newSubtask]);
  };

  const updateSubtaskTitle = (subtaskId: string, title: string) => {
    setNewTaskSubtasks(prev => prev.map(st => 
      st.id === subtaskId ? { ...st, title } : st
    ));
  };

  const removeSubtaskFromNewTask = (subtaskId: string) => {
    setNewTaskSubtasks(prev => prev.filter(st => st.id !== subtaskId));
  };

  const handleCreateProject = () => {
    if (!projectForm.name.trim()) return;

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projectForm.name,
      description: projectForm.description,
      category: projectForm.category,
      startDate: projectForm.startDate,
      targetDate: projectForm.targetDate,
      color: projectForm.color,
      icon: projectForm.icon,
      status: 'active',
      progress: 0,
      tasks: [],
      habits: [],
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create initial tasks for the project
    const projectTasks: string[] = [];
    projectForm.initialTasks.forEach(taskData => {
      const task: Task = {
        id: crypto.randomUUID(),
        title: taskData.title,
        description: '',
        subtasks: taskData.subtasks,
        dueDate: taskData.dueDate,
        priority: 'Medium',
        recurrence: 'None',
        xpValue: 10,
        category: 'Work',
        completed: false,
        taskType: 'normal',
        type: 'task',
        projectId: newProject.id
      };
      addTask(task);
      projectTasks.push(task.id);
    });

    newProject.tasks = projectTasks;
    setProjects(prev => [...prev, newProject]);
    setIsCreating(false);
    resetForm();
  };

  const addTaskToExistingProject = (projectId: string) => {
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      description: '',
      subtasks: newTaskSubtasks.filter(st => st.title.trim()),
      dueDate: newTaskDueDate || new Date(),
      priority: 'Medium',
      recurrence: 'None',
      xpValue: 10,
      category: 'Work',
      completed: false,
      taskType: 'normal',
      type: 'task',
      projectId
    };

    addTask(task);

    // Update project tasks list
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            tasks: [...project.tasks, task.id],
            updatedAt: new Date()
          }
        : project
    ));

    setNewTaskTitle('');
    setNewTaskDueDate(new Date());
    setNewTaskSubtasks([]);
  };

  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status, updatedAt: new Date() }
        : project
    ));
  };

  const addNoteToProject = (projectId: string) => {
    if (!newNote.trim()) return;

    const note: ProjectNote = {
      id: crypto.randomUUID(),
      content: newNote.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            notes: [...project.notes, note],
            updatedAt: new Date()
          }
        : project
    ));

    setNewNote('');
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-blue-500" />
            Project Manager
          </h2>
          <p className="text-muted-foreground">
            Organize tasks, habits, and notes into focused projects
          </p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="e.g., Website Redesign"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Brief description of the project"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={projectForm.category}
                  onValueChange={(value: Project['category']) => setProjectForm({ ...projectForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short-term">Short-term (1-3 months)</SelectItem>
                    <SelectItem value="long-term">Long-term (3+ months)</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !projectForm.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {projectForm.startDate ? format(projectForm.startDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={projectForm.startDate}
                        onSelect={(date) => setProjectForm({ ...projectForm, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium">Target Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !projectForm.targetDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {projectForm.targetDate ? format(projectForm.targetDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={projectForm.targetDate}
                        onSelect={(date) => setProjectForm({ ...projectForm, targetDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {PROJECT_COLORS.slice(0, 4).map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          projectForm.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setProjectForm({ ...projectForm, color })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Icon</label>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {PROJECT_ICONS.slice(0, 5).map((icon) => (
                      <Button
                        key={icon}
                        variant={projectForm.icon === icon ? "default" : "outline"}
                        className="text-lg h-8 w-8 p-0"
                        onClick={() => setProjectForm({ ...projectForm, icon })}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Initial Tasks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Initial Tasks (Optional)</label>
                </div>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium">Task Title</label>
                      <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Enter task name..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Due Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newTaskDueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTaskDueDate ? format(newTaskDueDate, "PPP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newTaskDueDate}
                            onSelect={setNewTaskDueDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Subtasks for new task */}
                  <div>
                    <label className="text-xs font-medium">Subtasks (Optional)</label>
                    <div className="space-y-2">
                      {newTaskSubtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-2">
                          <Input
                            value={subtask.title}
                            onChange={(e) => updateSubtaskTitle(subtask.id, e.target.value)}
                            placeholder="Subtask title..."
                            className="flex-1 text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSubtaskFromNewTask(subtask.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSubtaskToNewTask}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subtask
                      </Button>
                    </div>
                  </div>

                  <Button onClick={addTaskToProject} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task to Project
                  </Button>
                </div>

                {/* Display added tasks */}
                {projectForm.initialTasks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Tasks to be created:</h4>
                    {projectForm.initialTasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <span className="text-sm font-medium">{task.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            Due: {format(task.dueDate, 'MMM dd')}
                          </span>
                          {task.subtasks.length > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({task.subtasks.length} subtasks)
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTaskFromProject(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateProject} className="flex-1">
                  Create Project
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid - Remove progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeProjects.map((project) => {
          const projectTasks = getProjectTasks(project.id);
          return (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {project.category}
                      </Badge>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{projectTasks.length} tasks</span>
                    <span>{project.notes.length} notes</span>
                  </div>
                  
                  {project.targetDate && (
                    <p className="text-xs text-muted-foreground">
                      Due: {format(project.targetDate, 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: selectedProject.color }}
                    >
                      {selectedProject.icon}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedProject.name}</DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{selectedProject.category}</Badge>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedProject.status)}`} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateProjectStatus(selectedProject.id, 
                        selectedProject.status === 'active' ? 'paused' : 'active'
                      )}
                    >
                      {selectedProject.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateProjectStatus(selectedProject.id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedProject.description && (
                  <p className="text-muted-foreground">{selectedProject.description}</p>
                )}
                
                <Tabs defaultValue="tasks" className="w-full">
                  <TabsList>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tasks" className="space-y-4">
                    {/* Add new task section */}
                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Add New Task</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Task title..."
                          />
                        </div>
                        <div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newTaskDueDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newTaskDueDate ? format(newTaskDueDate, "PPP") : "Pick date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newTaskDueDate}
                                onSelect={setNewTaskDueDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Subtasks (Optional)</label>
                        <div className="space-y-2">
                          {newTaskSubtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center gap-2">
                              <Input
                                value={subtask.title}
                                onChange={(e) => updateSubtaskTitle(subtask.id, e.target.value)}
                                placeholder="Subtask title..."
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSubtaskFromNewTask(subtask.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSubtaskToNewTask}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subtask
                          </Button>
                        </div>
                      </div>

                      <Button onClick={() => addTaskToExistingProject(selectedProject.id)} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>

                    {/* Display project tasks */}
                    <div className="space-y-3">
                      {getProjectTasks(selectedProject.id).map((task) => (
                        <div key={task.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => completeTask(task.id)}
                                className="rounded"
                              />
                              <div>
                                <span className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </span>
                                <div className="text-xs text-muted-foreground">
                                  Due: {format(task.dueDate, 'MMM dd, yyyy')}
                                  {task.subtasks.length > 0 && (
                                    <span className="ml-2">
                                      ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {task.subtasks.length > 0 && (
                            <div className="ml-6 mt-2 space-y-1">
                              {task.subtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    onChange={() => toggleSubtask(task.id, subtask.id)}
                                    className="rounded text-xs"
                                  />
                                  <span className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {subtask.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {getProjectTasks(selectedProject.id).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No tasks yet</p>
                        <p className="text-sm">Add your first task above to get started.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Tasks</span>
                              <span className="font-medium">{getProjectTasks(selectedProject.id).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Completed Tasks</span>
                              <span className="font-medium">{getProjectTasks(selectedProject.id).filter(t => t.completed).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Notes</span>
                              <span className="font-medium">{selectedProject.notes.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Status</span>
                              <Badge variant="outline">{selectedProject.status}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        onKeyPress={(e) => e.key === 'Enter' && addNoteToProject(selectedProject.id)}
                      />
                      <Button onClick={() => addNoteToProject(selectedProject.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedProject.notes.map((note) => (
                        <Card key={note.id}>
                          <CardContent className="pt-4">
                            <p className="text-sm">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(note.createdAt, 'MMM dd, yyyy • HH:mm')}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {selectedProject.notes.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No notes yet</p>
                        <p className="text-sm">Add your first note above to track project insights.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No projects created yet</h3>
          <p className="text-sm mb-4">Create your first project to organize your work!</p>
          <p className="text-xs">Examples: "Website Redesign", "Fitness Journey", "Learn Spanish"</p>
        </div>
      )}
    </div>
  );
}
