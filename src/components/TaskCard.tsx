
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Edit2, Trash2, Star, Zap, Users, RotateCcw } from 'lucide-react';
import { Task } from '../types/task';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string) => void;
}

export function TaskCard({ task, onComplete, onEdit, onDelete, onSubtaskToggle }: TaskCardProps) {
  const priorityColors = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleComplete = () => {
    if (!task.completed) {
      onComplete(task.id);
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      task.completed 
        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
        : task.taskType === 'surplus' 
          ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
          : 'hover:border-primary/30'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Completion Checkbox */}
          <div className="mt-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleComplete}
              className="h-5 w-5"
              disabled={task.completed}
            />
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Header with title and badges */}
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h3 className={`font-medium text-sm sm:text-base leading-tight ${
                task.completed ? 'line-through text-muted-foreground' : ''
              }`}>
                {task.title}
              </h3>
              
              <div className="flex flex-wrap gap-1">
                {task.isRoutine && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <Users className="h-3 w-3 mr-1" />
                    Routine
                  </Badge>
                )}
                {task.type === 'habit' && (
                  <Badge variant="outline" className="text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Habit
                  </Badge>
                )}
                {task.taskType === 'surplus' && (
                  <Badge className="text-xs bg-purple-500">
                    <Star className="h-3 w-3 mr-1" />
                    Surplus
                  </Badge>
                )}
                <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                  {task.priority}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className={`text-xs sm:text-sm text-muted-foreground mb-2 ${
                task.completed ? 'line-through' : ''
              }`}>
                {task.description}
              </p>
            )}

            {/* Subtasks */}
            {task.subtasks.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Subtasks ({completedSubtasks}/{totalSubtasks})
                  </span>
                  <Progress value={subtaskProgress} className="w-16 h-2" />
                </div>
                
                <div className="space-y-1">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => onSubtaskToggle(task.id, subtask.id)}
                        className="h-4 w-4"
                        disabled={task.completed}
                      />
                      <span className={`text-xs ${
                        subtask.completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with metadata and actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>{task.xpValue} XP</span>
                </div>
                
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {task.category}
                </Badge>

                {task.recurrence !== 'None' && (
                  <div className="flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    <span>{task.recurrence}</span>
                  </div>
                )}

                {task.routineName && (
                  <Badge variant="secondary" className="text-xs">
                    {task.routineName}
                  </Badge>
                )}
              </div>

              {/* Action buttons */}
              {!task.completed && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(task)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(task.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Completion timestamp */}
            {task.completed && task.completedAt && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                ✓ Completed {format(new Date(task.completedAt), 'MMM dd, yyyy \'at\' h:mm a')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
