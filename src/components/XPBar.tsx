
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap } from 'lucide-react';
import { UserProgress, XP_PER_LEVEL } from '../types/task';

interface XPBarProps {
  progress: UserProgress;
  className?: string;
}

export function XPBar({ progress, className = '' }: XPBarProps) {
  const currentLevelXP = progress.totalXP % XP_PER_LEVEL;
  const levelProgress = (currentLevelXP / XP_PER_LEVEL) * 100;
  const xpToNextLevel = XP_PER_LEVEL - currentLevelXP;

  return (
    <div className={`bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="font-bold text-lg">Level {progress.level}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span>{progress.totalXP} XP</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress to Level {progress.level + 1}</span>
          <span>{currentLevelXP}/{XP_PER_LEVEL} XP</span>
        </div>
        <Progress value={levelProgress} className="h-3" />
        <div className="text-xs text-muted-foreground text-center">
          {xpToNextLevel} XP to next level
        </div>
      </div>
    </div>
  );
}
