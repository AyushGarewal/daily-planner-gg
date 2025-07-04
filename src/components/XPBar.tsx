
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap } from 'lucide-react';
import { UserProgress, getCurrentLevel, getXPRequiredForLevel, getXPForCurrentLevel, getXPForNextLevel } from '../types/task';

interface XPBarProps {
  progress: UserProgress;
  className?: string;
}

export function XPBar({ progress, className = '' }: XPBarProps) {
  const currentLevelXP = getXPForCurrentLevel(progress.totalXP);
  const nextLevelXPRequired = getXPForNextLevel(progress.totalXP);
  const levelProgress = nextLevelXPRequired > 0 ? (currentLevelXP / nextLevelXPRequired) * 100 : 100;
  const xpToNextLevel = nextLevelXPRequired - currentLevelXP;

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
          <span>{currentLevelXP}/{nextLevelXPRequired} XP</span>
        </div>
        <Progress value={levelProgress} className="h-3" />
        {xpToNextLevel > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            {xpToNextLevel} XP to next level
          </div>
        )}
      </div>
    </div>
  );
}
