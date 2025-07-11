
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Flame, Target } from 'lucide-react';
import { UserProgress, getXPForCurrentLevel, getXPForNextLevel } from '../types/task';

interface ProgressTrackerProps {
  progress: UserProgress;
  todayCompletionPercentage: number;
}

export function ProgressTracker({ progress, todayCompletionPercentage }: ProgressTrackerProps) {
  const currentLevelXP = getXPForCurrentLevel(progress.totalXP);
  const nextLevelXP = getXPForNextLevel(progress.totalXP);
  const levelProgress = nextLevelXP > 0 ? (currentLevelXP / nextLevelXP) * 100 : 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion</span>
              <span className="font-medium">{todayCompletionPercentage}%</span>
            </div>
            <Progress value={todayCompletionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Level {progress.level}</span>
              <Badge variant="outline">{progress.totalXP} XP</Badge>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {currentLevelXP}/{nextLevelXP} XP to next level
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progress.currentStreak}</div>
          <div className="text-sm text-muted-foreground">days</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            Best Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progress.maxStreak}</div>
          <div className="text-sm text-muted-foreground">days</div>
        </CardContent>
      </Card>
    </div>
  );
}
