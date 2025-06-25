
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Edit, Trash2, Star, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const subtaskProgress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;
  
  const priorityColors = {
    High: 'bg-red-500',
    Medium: 'bg-yellow-500',
    Low: 'bg-green-500',
  };

  return (
    <Card className={`transition-all duration-200 ${task.completed ? 'opacity-70' : 'hover:shadow-md'} ${task.taskType === 'surplus' ? 'border-purple-200 bg-purple-50/50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => !task.completed && onComplete(task.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <CardTitle className={`text-lg flex items-center gap-2 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
                {task.taskType === 'surplus' && (
                  <Gift className="h-4 w-4 text-purple-500" />
                )}
              </CardTitle>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${priorityColors[task.priority]} text-white border-none`}>
              {task.priority}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{task.xpValue}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {task.subtasks.length > 0 && (
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Subtasks</span>
                <span>{completedSubtasks}/{task.subtasks.length}</span>
              </div>
              <Progress value={subtaskProgress} className="h-2" />
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
              </div>
              <Badge variant="secondary">{task.category}</Badge>
              {task.recurrence !== 'None' && (
                <Badge variant="outline">{task.recurrence}</Badge>
              )}
              {task.taskType === 'surplus' && (
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  Surplus
                </Badge>
              )}
            </div>
            
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
