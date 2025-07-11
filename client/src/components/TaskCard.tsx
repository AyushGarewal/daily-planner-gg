
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Trash2, Edit, Target, FolderOpen } from 'lucide-react';
import { Task } from '../types/task';
import { SubtaskManager } from './SubtaskManager';
import { HabitRecurrenceStatus } from './HabitRecurrenceStatus';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string) => void;
  showDate?: boolean;
}

export function TaskCard({ 
  task, 
  onComplete, 
  onDelete, 
  onEdit, 
  onSubtaskToggle,
  showDate = true 
}: TaskCardProps) {
  const priorityColors = {
    High: 'border-red-200 bg-red-50',
    Medium: 'border-yellow-200 bg-yellow-50',
    Low: 'border-green-200 bg-green-50'
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Star className="h-4 w-4 text-red-500 fill-red-500" />;
      case 'Medium':
        return <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
      case 'Low':
        return <Star className="h-4 w-4 text-green-500 fill-green-500" />;
      default:
        return <Star className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCompletionPercentage = () => {
    if (!task.subtasks || task.subtasks.length === 0) return 100;
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  const isPartiallyCompleted = () => {
    if (!task.subtasks || task.subtasks.length === 0) return false;
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    return completedSubtasks > 0 && completedSubtasks < task.subtasks.length;
  };

  return (
    <Card className={`${priorityColors[task.priority]} ${task.completed ? 'opacity-75' : ''} transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onComplete(task.id)}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-xs text-muted-foreground mt-1 ${task.completed ? 'line-through' : ''}`}>
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getPriorityIcon(task.priority)}
                  <span>{task.xpValue} XP</span>
                </div>
              </div>

              {/* Task Details */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {task.category}
                </Badge>
                
                {task.type === 'habit' && (
                  <HabitRecurrenceStatus habit={task} />
                )}
                
                {task.projectId && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    Project
                  </Badge>
                )}
                
                {task.goalId && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Goal
                  </Badge>
                )}

                {showDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                  </div>
                )}

                {task.subtasks && task.subtasks.length > 0 && (
                  <Badge 
                    variant={isPartiallyCompleted() ? "default" : "outline"} 
                    className="text-xs"
                  >
                    {getCompletionPercentage()}% complete
                  </Badge>
                )}
              </div>

              {/* Subtasks */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-3">
                  <SubtaskManager
                    subtasks={task.subtasks}
                    onSubtaskToggle={(subtaskId) => onSubtaskToggle(task.id, subtaskId)}
                    isMainTaskCompleted={task.completed}
                    xpValue={task.xpValue}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
