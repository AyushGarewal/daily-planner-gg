
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Subtask } from '../types/task';

interface SubtaskManagerProps {
  subtasks: Subtask[];
  onSubtaskToggle: (subtaskId: string) => void;
  isMainTaskCompleted: boolean;
}

export function SubtaskManager({ subtasks, onSubtaskToggle, isMainTaskCompleted }: SubtaskManagerProps) {
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;
  const allSubtasksCompleted = subtasks.length > 0 && completedSubtasks === subtasks.length;

  if (subtasks.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Subtasks ({completedSubtasks}/{subtasks.length})</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <Progress value={progress} className="h-2" />
      
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => !isMainTaskCompleted && onSubtaskToggle(subtask.id)}
              disabled={isMainTaskCompleted}
            />
            <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
              {subtask.title}
            </span>
          </div>
        ))}
      </div>
      
      {subtasks.length > 0 && !allSubtasksCompleted && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>XP awarded: {Math.round(progress)}% of total task XP</p>
          <p>Complete all subtasks to count for streak</p>
        </div>
      )}
      
      {allSubtasksCompleted && (
        <div className="text-xs text-green-600">
          ✓ All subtasks completed - full XP and streak credit earned!
        </div>
      )}
    </div>
  );
}
