
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CheckCircle2, Circle, Calendar, Target } from 'lucide-react';
import { TaskForm } from './TaskForm';
import { TaskCard } from './TaskCard';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/task';

interface ProjectTaskIntegrationProps {
  projectId: string;
  projectName: string;
  projectColor: string;
  onTaskComplete?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

export function ProjectTaskIntegration({ 
  projectId, 
  projectName, 
  projectColor, 
  onTaskComplete,
  onTaskEdit,
  onTaskDelete 
}: ProjectTaskIntegrationProps) {
  const { tasks, addTask, completeTask, updateTask, deleteTask, toggleSubtask } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Get tasks for this project
  const projectTasks = tasks.filter(task => task.projectId === projectId);
  const completedTasks = projectTasks.filter(task => task.completed);
  const progressPercentage = projectTasks.length > 0 
    ? Math.round((completedTasks.length / projectTasks.length) * 100)
    : 0;

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const taskWithProject = {
      ...taskData,
      projectId
    };
    addTask(taskWithProject);
    setIsFormOpen(false);
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (editingTask) {
      updateTask(editingTask.id, { ...taskData, projectId });
      setEditingTask(null);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    onTaskComplete?.(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    onTaskDelete?.(taskId);
  };

  const handleEditTaskClick = (task: Task) => {
    setEditingTask(task);
    onTaskEdit?.(task);
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
    toggleSubtask(taskId, subtaskId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: projectColor }}
            />
            <CardTitle className="text-lg">
              {projectName} Tasks
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {projectTasks.length} tasks
            </Badge>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle>Add Task to {projectName}</DialogTitle>
              </DialogHeader>
              <TaskForm
                onSubmit={handleAddTask}
                onCancel={() => setIsFormOpen(false)}
                preSelectedProjectId={projectId}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress Section */}
        {projectTasks.length > 0 && (
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Project Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {completedTasks.length} of {projectTasks.length} tasks completed
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {projectTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-2">No tasks in this project yet</p>
            <p className="text-xs">Add tasks to track progress toward your project goals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                <TaskCard
                  task={task}
                  onComplete={handleCompleteTask}
                  onEdit={handleEditTaskClick}
                  onDelete={handleDeleteTask}
                  onSubtaskToggle={handleSubtaskToggle}
                  showProject={false} // Don't show project info since we're already in project context
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              initialTask={editingTask}
              onSubmit={handleEditTask}
              onCancel={() => setEditingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
