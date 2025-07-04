
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { format } from 'date-fns';

interface TaskManagerProps {
  showAllTasks?: boolean;
}

export function TaskManager({ showAllTasks = false }: TaskManagerProps) {
  const { tasks, addTask, completeTask, uncompleteTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const displayTasks = showAllTasks 
    ? tasks 
    : tasks.filter(task => {
        const today = new Date();
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === today.toDateString();
      });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle,
        description: '',
        subtasks: [],
        dueDate: new Date(),
        priority: 'Medium',
        recurrence: 'None',
        xpValue: 10,
        category: 'General',
        taskType: 'normal',
        type: 'task'
      });
      setNewTaskTitle('');
      setShowAddForm(false);
    }
  };

  const handleToggleTask = (taskId: string, isCompleted: boolean) => {
    if (isCompleted) {
      uncompleteTask(taskId);
    } else {
      completeTask(taskId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {showAllTasks ? 'All Tasks' : 'Today\'s Tasks'}
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="flex gap-2 p-4 bg-muted rounded-lg">
            <Input
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask} size="sm">
              Add
            </Button>
          </div>
        )}

        {displayTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No tasks yet</p>
            <p className="text-sm">Add your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className={`p-1 ${
                        task.completed
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                    <div>
                      <h4 className={`font-medium ${
                        task.completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        <span>•</span>
                        <span className="capitalize">{task.category}</span>
                        <span>•</span>
                        <span className="capitalize">{task.priority}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={task.completed ? "default" : "outline"}>
                    +{task.xpValue} XP
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
