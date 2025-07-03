
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Subtask } from '../types/task';

interface SubtaskManagerProps {
  subtasks: Subtask[];
  onSubtaskToggle: (subtaskId: string) => void;
  isMainTaskCompleted: boolean;
  xpValue?: number;
}

export function SubtaskManager({ subtasks, onSubtaskToggle, isMainTaskCompleted, xpValue = 10 }: SubtaskManagerProps) {
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;
  const allSubtasksCompleted = subtasks.length > 0 && completedSubtasks === subtasks.length;

  if (subtasks.length === 0) return null;

  const currentXP = Math.round((xpValue * progress) / 100);
  const remainingXP = xpValue - currentXP;

  console.log(`SubtaskManager: ${completedSubtasks}/${subtasks.length} completed (${Math.round(progress)}%)`);
  console.log(`XP calculation: ${currentXP}/${xpValue} XP (${Math.round(progress)}% of total)`);
  console.log(`All completed: ${allSubtasksCompleted}, Streak eligible: ${allSubtasksCompleted}`);

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
        <div className="text-xs text-muted-foreground space-y-1 bg-blue-50 p-2 rounded">
          <p className="font-medium">XP Progress:</p>
          <p>✅ XP awarded: {currentXP} / {xpValue} XP ({Math.round(progress)}%)</p>
          <p>🔥 Streak: Only counts when ALL subtasks completed</p>
          {remainingXP > 0 && (
            <p>📈 {remainingXP} XP remaining when all subtasks completed</p>
          )}
        </div>
      )}
      
      {allSubtasksCompleted && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded font-medium">
          ✅ All subtasks completed - full XP ({xpValue} XP) and streak credit earned!
        </div>
      )}
    </div>
  );
}
